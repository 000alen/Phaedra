import React from "react";
import { CommandBar } from "@fluentui/react";
import { useReactToPrint } from "react-to-print";

export default function ViewItems({
  notebookRef,
  commandBoxRef,
  appController,
  pageController,
}) {
  const print = useReactToPrint({
    content: () => notebookRef.current,
    print: (htmlContentToPrint) => {
      return new Promise((resolve, reject) => {
        console.log(htmlContentToPrint);
        resolve(true);
      });
    },
  });

  const handleExport = () => {
    if (print === undefined) throw new Error("print is undefined");

    print();
  };

  const viewItems = [
    {
      key: "export",
      name: "Export",
      iconProps: { iconName: "Export" },
      onClick: handleExport,
    },
  ];

  return <CommandBar items={viewItems} />;
}
