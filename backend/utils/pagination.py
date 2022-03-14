from rest_framework import pagination


class ExpandedPagination(pagination.PageNumberPagination):
    """
    Utility class to expand the pagination size for a specific view.
    Use by adding `pagination_class = ExpandedPagination` to the view.
    """

    page_size = 1000  # Default size without this class: 10
