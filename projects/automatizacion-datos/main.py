from dotenv import load_dotenv

from src.controllers.cli_controller import CliController

if __name__ == '__main__':
    load_dotenv()
    CliController().execute()
