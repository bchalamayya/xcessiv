"""This module contains preset settings for defining base learners"""
from __future__ import absolute_import, print_function, division, unicode_literals
from xcessiv.presets import learnersource


__all__ = [
    'sklearn_random_forest',
    'sklearn_extra_trees',
    'sklearn_logistic_regression',
    'sklearn_knn_classifier'
]


sklearn_random_forest = {
    'name': 'scikit-learn Random Forest',
    'source': learnersource.sklearn_random_forest_source,
    'meta_feature_generator': 'predict_proba'
}

sklearn_extra_trees = {
    'name': 'scikit-learn Extra Trees Classifier',
    'source': learnersource.sklearn_extra_trees_source,
    'meta_feature_generator': 'predict_proba'
}

sklearn_logistic_regression = {
    'name': 'scikit-learn Logistic Regression',
    'source': learnersource.sklearn_logistic_regression_source,
    'meta_feature_generator': 'predict_proba'
}

sklearn_knn_classifier = {
    'name': 'scikit-learn KNN Classifier',
    'source': learnersource.sklearn_knn_classifier_source,
    'meta_feature_generator': 'predict_proba'
}