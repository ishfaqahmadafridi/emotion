import traceback
import logging
from django.http import JsonResponse
from rest_framework import status
from rest_framework.exceptions import APIException

logger = logging.getLogger("django")

class GlobalExceptionHandlerMiddleware:
    """
    Middleware to catch exceptions and return formatted JSON error response.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as exc:
            return self.process_exception(request, exc)

    def process_exception(self, request, exception):
        # Determine status code and message
        if isinstance(exception, APIException):
            status_code = exception.status_code
            error_message = exception.detail
            error_code = exception.default_code
        else:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            error_message = str(exception)
            error_code = "server_error"
            
            # Log standard Python traceback for non-API exceptions
            logger.error(f"Internal Server Error at path: {request.path}")
            logger.error(traceback.format_exc())

        # Build consistent error structure
        response_data = {
            "success": False,
            "error": error_message,
            "code": error_code,
        }

        # If it's REST exception detail format, extract properly
        if isinstance(error_message, dict) or isinstance(error_message, list):
            response_data["details"] = error_message
            # Flatten or format custom message
            if "detail" in error_message:
                response_data["error"] = error_message["detail"]
            else:
                response_data["error"] = "Validation failed"

        return JsonResponse(response_data, status=status_code)
