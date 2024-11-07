import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(project_root)

from .logger import logger  # Change this line to a relative import

def error_message_detail(error, error_detail: sys):
    _, _, exc_tb = error_detail.exc_info()
    file_name = exc_tb.tb_frame.f_code.co_filename

    error_message = "Error occurred in python script name [{0}] line number [{1}] error message [{2}]".format(
        file_name, exc_tb.tb_lineno, str(error)
    )

    return error_message

class CustomException(Exception):
    """Custom exception for recipe generation errors."""
    def __init__(self, message, sys):
        super().__init__(message)
        self.message = message
        self.sys = sys
        logger.error(f"CustomException: {message}")

if __name__ == "__main__":
    logging.info("Logging has started")
    try:
        a = 1 / 0
    except Exception as e:
        logging.info('Division by zero') 
        raise CustomException(e, sys)
