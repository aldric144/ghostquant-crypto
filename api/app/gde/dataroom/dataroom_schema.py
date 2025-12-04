"""
Data Room Schema

Dataclasses for investor data room structure.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime


@dataclass
class DataRoomFile:
    """
    Individual file in data room
    
    Attributes:
        name: File name
        description: File description
        content: File content (text/markdown)
        file_type: File type (md, pdf, json, html)
        size_bytes: File size in bytes
        classification: Access level (public, confidential, restricted, nda_required)
        created_at: Creation timestamp
        updated_at: Last update timestamp
        metadata: Additional metadata
    """
    name: str
    description: str
    content: str
    file_type: str = "md"
    size_bytes: int = 0
    classification: str = "confidential"
    created_at: str = ""
    updated_at: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.utcnow().isoformat()
        if not self.updated_at:
            self.updated_at = datetime.utcnow().isoformat()
        if not self.size_bytes:
            self.size_bytes = len(self.content.encode('utf-8'))
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'name': self.name,
            'description': self.description,
            'content': self.content,
            'file_type': self.file_type,
            'size_bytes': self.size_bytes,
            'classification': self.classification,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'metadata': self.metadata
        }


@dataclass
class DataRoomFolder:
    """
    Folder containing files and subfolders
    
    Attributes:
        name: Folder name
        description: Folder description
        files: List of files in folder
        subfolders: List of subfolders
        classification: Access level
        risk_level: Risk classification (low, medium, high)
        metadata: Additional metadata
    """
    name: str
    description: str
    files: List[DataRoomFile] = field(default_factory=list)
    subfolders: List['DataRoomFolder'] = field(default_factory=list)
    classification: str = "confidential"
    risk_level: str = "low"
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'name': self.name,
            'description': self.description,
            'files': [f.to_dict() for f in self.files],
            'subfolders': [sf.to_dict() for sf in self.subfolders],
            'classification': self.classification,
            'risk_level': self.risk_level,
            'metadata': self.metadata,
            'file_count': len(self.files),
            'subfolder_count': len(self.subfolders)
        }


@dataclass
class DataRoomSection:
    """
    Major section in data room
    
    Attributes:
        name: Section name
        description: Section description
        folder: Root folder for section
        order: Display order
        classification: Access level
        risk_level: Risk classification
        metadata: Additional metadata
    """
    name: str
    description: str
    folder: DataRoomFolder
    order: int = 0
    classification: str = "confidential"
    risk_level: str = "low"
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'name': self.name,
            'description': self.description,
            'folder': self.folder.to_dict(),
            'order': self.order,
            'classification': self.classification,
            'risk_level': self.risk_level,
            'metadata': self.metadata
        }


@dataclass
class DataRoomPackage:
    """
    Complete data room package
    
    Attributes:
        company_name: Company name
        sections: List of sections
        access_level: Current access level
        generated_at: Generation timestamp
        version: Package version
        metadata: Additional metadata
    """
    company_name: str
    sections: List[DataRoomSection]
    access_level: str = "investor"
    generated_at: str = ""
    version: str = "1.0.0"
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.generated_at:
            self.generated_at = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'company_name': self.company_name,
            'sections': [s.to_dict() for s in self.sections],
            'access_level': self.access_level,
            'generated_at': self.generated_at,
            'version': self.version,
            'metadata': self.metadata,
            'section_count': len(self.sections),
            'total_files': sum(len(s.folder.files) for s in self.sections)
        }


@dataclass
class DataRoomSummary:
    """
    Summary of data room contents
    
    Attributes:
        company_name: Company name
        total_sections: Number of sections
        total_files: Number of files
        total_size_bytes: Total size in bytes
        access_level: Current access level
        classifications: Count by classification
        risk_levels: Count by risk level
        generated_at: Generation timestamp
    """
    company_name: str
    total_sections: int
    total_files: int
    total_size_bytes: int
    access_level: str
    classifications: Dict[str, int]
    risk_levels: Dict[str, int]
    generated_at: str = ""
    
    def __post_init__(self):
        if not self.generated_at:
            self.generated_at = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'company_name': self.company_name,
            'total_sections': self.total_sections,
            'total_files': self.total_files,
            'total_size_bytes': self.total_size_bytes,
            'total_size_mb': round(self.total_size_bytes / (1024 * 1024), 2),
            'access_level': self.access_level,
            'classifications': self.classifications,
            'risk_levels': self.risk_levels,
            'generated_at': self.generated_at
        }
