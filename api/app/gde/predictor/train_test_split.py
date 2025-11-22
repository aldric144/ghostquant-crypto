from typing import Dict, List, Any
import random
from datetime import datetime


class TrainTestSplitGenerator:
    """
    Train/Test split generator for GhostPredictor ML datasets.
    Supports random, time-based, and balanced splitting strategies.
    """

    def random_split(self, dataset: List[dict], test_ratio: float = 0.2) -> Dict[str, List[dict]]:
        """
        Random shuffle and split into train/test sets.
        
        Args:
            dataset: List of feature dictionaries
            test_ratio: Fraction of data for test set (default 0.2)
            
        Returns:
            {"train": [...], "test": [...]}
        """
        if not dataset:
            return {"train": [], "test": []}
        
        try:
            shuffled = dataset.copy()
            random.shuffle(shuffled)
            
            test_size = int(len(shuffled) * test_ratio)
            
            test_set = shuffled[:test_size]
            train_set = shuffled[test_size:]
            
            return {"train": train_set, "test": test_set}
        
        except Exception:
            return {"train": [], "test": []}

    def time_based_split(
        self, 
        dataset: List[dict], 
        timestamp_key: str = "timestamp", 
        test_ratio: float = 0.2
    ) -> Dict[str, List[dict]]:
        """
        Time-based split: sort by timestamp, last X% = test set.
        
        Args:
            dataset: List of feature dictionaries
            timestamp_key: Key containing timestamp data
            test_ratio: Fraction of data for test set (default 0.2)
            
        Returns:
            {"train": [...], "test": [...]}
        """
        if not dataset:
            return {"train": [], "test": []}
        
        try:
            valid_data = [d for d in dataset if timestamp_key in d]
            
            if not valid_data:
                return {"train": [], "test": []}
            
            sorted_data = sorted(valid_data, key=lambda x: x.get(timestamp_key, 0))
            
            test_size = int(len(sorted_data) * test_ratio)
            
            train_set = sorted_data[:-test_size] if test_size > 0 else sorted_data
            test_set = sorted_data[-test_size:] if test_size > 0 else []
            
            return {"train": train_set, "test": test_set}
        
        except Exception:
            return {"train": [], "test": []}

    def balanced_split(
        self, 
        dataset: List[dict], 
        label_key: str = "label", 
        test_ratio: float = 0.2
    ) -> Dict[str, List[dict]]:
        """
        Balanced split: equal number of positive/negative examples in train/test.
        
        Args:
            dataset: List of feature dictionaries
            label_key: Key containing label (0 or 1)
            test_ratio: Fraction of data for test set (default 0.2)
            
        Returns:
            {"train": [...], "test": [...]}
        """
        if not dataset:
            return {"train": [], "test": []}
        
        try:
            positives = [d for d in dataset if d.get(label_key) == 1]
            negatives = [d for d in dataset if d.get(label_key) == 0]
            
            if not positives and not negatives:
                return {"train": [], "test": []}
            
            random.shuffle(positives)
            random.shuffle(negatives)
            
            pos_test_size = int(len(positives) * test_ratio)
            neg_test_size = int(len(negatives) * test_ratio)
            
            pos_test = positives[:pos_test_size]
            pos_train = positives[pos_test_size:]
            
            neg_test = negatives[:neg_test_size]
            neg_train = negatives[neg_test_size:]
            
            train_set = pos_train + neg_train
            test_set = pos_test + neg_test
            
            random.shuffle(train_set)
            random.shuffle(test_set)
            
            return {"train": train_set, "test": test_set}
        
        except Exception:
            return {"train": [], "test": []}

    def summary(self, train: List[dict], test: List[dict]) -> Dict[str, Any]:
        """
        Generate summary statistics for train/test split.
        
        Args:
            train: Training set
            test: Test set
            
        Returns:
            Dictionary with split statistics
        """
        try:
            train_count = len(train)
            test_count = len(test)
            
            positive_train = sum(1 for d in train if d.get("label") == 1)
            positive_test = sum(1 for d in test if d.get("label") == 1)
            
            ratio = test_count / train_count if train_count > 0 else 0.0
            
            return {
                "train_count": train_count,
                "test_count": test_count,
                "positive_train": positive_train,
                "positive_test": positive_test,
                "negative_train": train_count - positive_train,
                "negative_test": test_count - positive_test,
                "ratio": ratio,
                "total_count": train_count + test_count
            }
        
        except Exception:
            return {
                "train_count": 0,
                "test_count": 0,
                "positive_train": 0,
                "positive_test": 0,
                "negative_train": 0,
                "negative_test": 0,
                "ratio": 0.0,
                "total_count": 0
            }
