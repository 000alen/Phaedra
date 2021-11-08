import json
from typing import Callable, List, Tuple, Union

from rich.pretty import Pretty
from rich.table import Table
from rich.console import Console

from Phaedra.Notebook import Notebook
from Phaedra.API import authenticate, run, authenticate_remote, run_remote

_console = Console()


class CLIBase:
    console: Console = _console

    error_style: str = "bold red"
    log_style: str = ""
    print_style: str = ""

    def __init__(self, console: Console = None) -> None:
        if console:
            self.console = console

    def run(self):
        self.console.print(self.welcome)

        while True:
            try:
                string = self.console.input(self.prompt)
            except KeyboardInterrupt:
                self.exit()

            if not string:
                continue

            command, argument = self.parse(string)

            if self.has_command(command):
                try:
                    self.get_command(command)(argument)
                except Exception:
                    self.console.print_exception(show_locals=True)
            else:
                self.error(f"`{command}` command not found.")

    def error(self, string: str):
        self.console.log(string, style=self.error_style)

    def log(self, string: str):
        self.console.log(string, style=self.log_style)

    def print(self, string: str):
        self.console.print(string, style=self.print_style)

    def clear(self):
        self.console.clear()

    def exit(self):
        exit()

    def parse(self, string: str) -> Tuple[str, str]:
        command, *splitted = string.split(" ")
        argument = " ".join(splitted)
        return command, argument

    def commands(self) -> List[str]:
        return [method[8:] for method in dir(self) if method.startswith("command_")]

    def has_command(self, command: str) -> bool:
        return command in self.commands()

    def get_command(self, command: str) -> Callable:
        return getattr(self, f"command_{command}")

    def get_help(self, command: str) -> str:
        doc = self.get_command(command).__doc__
        return doc if doc else "No help available."

    def get_parameters(self, command: str):
        return self.get_command(command).__annotations__

    def command_help(self, *args):
        """Prints this."""

        table = Table("Command", "Description", "Parameters")
        for command in self.commands():
            table.add_row(
                command, self.get_help(command), Pretty(self.get_parameters(command))
            )

        self.console.print(table)

    def command_exit(self, *args):
        """Exits."""
        self.exit()

    def command_clear(self, *args):
        """Clears the terminal."""
        self.clear()


class CLI(CLIBase):
    welcome: str = "Welcome to [bold red]Phaedra[/]! :brain:"
    prompt: str = "[bold](Phaedra)[/] "

    notebook: Notebook
    notebook_path: str

    def load_notebook(self, path: str):
        """Loads a Notebook."""
        self.notebook = Notebook.from_json(file_path=path)
        self.notebook_path = path

    def save_notebook(self, path: Union[str, None] = None):
        """Saves the current Notebook."""
        if path is None:
            assert self.notebook_path is not None
            path = self.notebook_path

        assert self.notebook is not None
        json.dump(self.notebook.json(), open(path, "w"))

    def command_from_pdf(self, path: str):
        """Creates a Notebook from a PDF file."""
        self.notebook = Notebook.from_pdf(pdf_path=path)

    def command_from_text(self, path: str):
        """Creates a Notebook from a text file."""
        self.notebook = Notebook.from_text(open(path, "r").read())

    def command_load_notebook(self, path: str):
        """Loads a Notebook."""
        self.load_notebook(path)

    def command_save_notebook(self, path: str):
        """Saves the current Notebook."""
        self.save_notebook(path)

    def command_to_markdown(self, path: str):
        """Outputs current Notebook's Markdown representation"""
        assert self.notebook is not None
        with open(path, "w") as file:
            file.write(self.notebook.markdown())

    def command_authenticate(self, *args):
        """Loads secrets."""
        authenticate()

    def command_run(self, *args):
        """Serves Phaedra's API."""
        run()

    def command_authenticate_remote(self, *args):
        """Loads secrets from Google Drive. Must be ran from Google Colaboratory"""
        authenticate_remote()

    def command_run_remote(self, *args):
        """Serves Phaedra's API with ngrok"""
        run_remote()


if __name__ == "__main__":
    cli = CLI()
    cli.run()
