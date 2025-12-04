"""
Data Room Access Control

Manage access levels and permissions for data room content.
"""

from typing import List, Dict, Any
from enum import Enum

from .dataroom_schema import DataRoomSection


class AccessLevel(str, Enum):
    """Access levels for data room content"""
    PUBLIC = "public"
    INVESTOR = "investor"
    NDA = "nda"
    RESTRICTED = "restricted"


class DataRoomAccessControl:
    """
    Manage access control for data room content.
    
    Implements 4 clearance levels:
    - Public: Marketing materials, public information
    - Investor: Standard investor due diligence materials
    - NDA: Sensitive business information (requires NDA)
    - Restricted: Internal only (financials, legal, IP)
    """
    
    ACCESS_HIERARCHY = {
        AccessLevel.PUBLIC: ["public"],
        AccessLevel.INVESTOR: ["public", "confidential"],
        AccessLevel.NDA: ["public", "confidential", "restricted"],
        AccessLevel.RESTRICTED: ["public", "confidential", "restricted", "nda_required"]
    }
    
    LEVEL_DESCRIPTIONS = {
        AccessLevel.PUBLIC: "Public information available to anyone",
        AccessLevel.INVESTOR: "Standard investor due diligence materials",
        AccessLevel.NDA: "Sensitive business information (requires NDA)",
        AccessLevel.RESTRICTED: "Internal only (financials, legal, IP)"
    }
    
    @classmethod
    def filter_sections(cls, sections: List[DataRoomSection], level: AccessLevel) -> List[DataRoomSection]:
        """
        Filter sections based on access level.
        
        Args:
            sections: List of sections to filter
            level: Access level
            
        Returns:
            Filtered list of sections
        """
        allowed_classifications = cls.ACCESS_HIERARCHY.get(level, ["public"])
        
        filtered_sections = []
        for section in sections:
            if section.classification in allowed_classifications:
                filtered_sections.append(section)
                
        return filtered_sections
        
    @classmethod
    def get_allowed_sections(cls, sections: List[DataRoomSection], level: AccessLevel) -> List[str]:
        """
        Get list of section names allowed for access level.
        
        Args:
            sections: List of all sections
            level: Access level
            
        Returns:
            List of section names
        """
        filtered = cls.filter_sections(sections, level)
        return [section.name for section in filtered]
        
    @classmethod
    def check_access(cls, section: DataRoomSection, level: AccessLevel) -> bool:
        """
        Check if access level can view section.
        
        Args:
            section: Section to check
            level: Access level
            
        Returns:
            True if access allowed, False otherwise
        """
        allowed_classifications = cls.ACCESS_HIERARCHY.get(level, ["public"])
        return section.classification in allowed_classifications
        
    @classmethod
    def get_access_summary(cls, sections: List[DataRoomSection]) -> Dict[str, Any]:
        """
        Get summary of access levels and section counts.
        
        Args:
            sections: List of all sections
            
        Returns:
            Dictionary with access level summary
        """
        summary = {
            "total_sections": len(sections),
            "levels": {}
        }
        
        for level in AccessLevel:
            filtered = cls.filter_sections(sections, level)
            summary["levels"][level.value] = {
                "description": cls.LEVEL_DESCRIPTIONS[level],
                "sections_count": len(filtered),
                "sections": [s.name for s in filtered]
            }
            
        return summary
        
    @classmethod
    def get_level_info(cls, level: AccessLevel) -> Dict[str, Any]:
        """
        Get information about an access level.
        
        Args:
            level: Access level
            
        Returns:
            Dictionary with level information
        """
        return {
            "level": level.value,
            "description": cls.LEVEL_DESCRIPTIONS[level],
            "allowed_classifications": cls.ACCESS_HIERARCHY[level]
        }
        
    @classmethod
    def list_levels(cls) -> List[Dict[str, Any]]:
        """
        List all available access levels.
        
        Returns:
            List of access level information
        """
        return [cls.get_level_info(level) for level in AccessLevel]
