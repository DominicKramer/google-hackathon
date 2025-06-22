import datetime
import logging
import os
from typing import Optional, cast


def initialize_logging(log_dir: Optional[str] = "logs", enable_console: bool = True):
    logger = logging.getLogger("mark1")
    logger.setLevel(logging.DEBUG)

    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # Format it as YYYY-MM-DD_HH-MM-SS_microsecond
    now = datetime.datetime.now()
    formatted_time = now.strftime("%Y-%m-%d_%H-%M-%S_%f")

    log_file_name = None
    if log_dir is not None:
        os.makedirs(log_dir, exist_ok=True)
        log_file_name = os.path.join(log_dir, f"logs_{formatted_time}.txt")

        file_handler = logging.FileHandler(log_file_name)
        file_handler.setFormatter(formatter)
        file_handler.setLevel(logging.DEBUG)
        logger.addHandler(file_handler)

    if enable_console:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        console_handler.setLevel(logging.INFO)
        logger.addHandler(console_handler)

    global __system_logger
    __system_logger = logger

    return log_file_name


__system_logger = None


def get_system_logger() -> logging.Logger:
    global __system_logger
    if __system_logger is None:
        initialize_logging()

    return cast(logging.Logger, __system_logger)


def disable_logging():
    initialize_logging(log_dir=None, enable_console=False)
