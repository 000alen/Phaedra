import sys
import argparse
import json
from typing import List

from Phaedra.Notebook import Notebook
from Phaedra.API import run, run_remote

parser = argparse.ArgumentParser(prog="Phaedra")
parser.add_argument("-i", "--input")
parser.add_argument("-o", "--output")
parser.add_argument("--from-pdf", action="store_true")
parser.add_argument("--from-text", action="store_true")
parser.add_argument("--to-markdown", action="store_true")
parser.add_argument("--run", action="store_true")
parser.add_argument("--run-remote", action="store_true")


def main(_args: List[str]):
    """Command line interface for Phaedra.

    :param args: Command line arguments.
    :type args: List[str]
    
    """

    args = parser.parse_args(_args)
    if args.from_pdf:
        notebook = Notebook.from_pdf(document_path=args.input)
        _json = json.dumps(notebook.json())
        if args.output is None:
            print(_json)
        else:
            with open(args.output, "w") as file:
                file.write(_json)
    elif args.from_text:
        text = open(args.input, "r").read()
        notebook = Notebook.from_text(text=text)
        _json = json.dumps(notebook.json())
        if args.output is None:
            print(_json)
        else:
            with open(args.output, "w") as file:
                file.write(_json)
    elif args.to_markdown:
        notebook = Notebook.from_json(file_path=args.input)
        markdown = notebook.markdown()
        if args.output is None:
            print(markdown)
        else:
            with open(args.output, "w") as file:
                file.write(markdown)
    elif args.run:
        run()
    elif args.run_remote:
        run_remote()


if __name__ == "__main__":
    main(sys.argv[1:])
