class Logger:
    def info(self, text: str):
        print(f"INFO: {text}")

    def error(self, text: str):
        print(f"ERROR: {text}")


def get_system_logger() -> Logger:
    return Logger()
