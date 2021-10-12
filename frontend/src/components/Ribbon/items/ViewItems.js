import React from "react";
import { CommandBar } from "@fluentui/react";
import html2canvas from "html2canvas";

export default function ViewItems({
  notebookRef,
  commandBoxRef,
  appController,
  pageController,
}) {
  const handleExport = () => {
    html2canvas(document.getElementById("notebook")).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "screenshot.png";
      link.click();
    });
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
