import React from "react";
import { useOutletContext } from "react-router-dom";
import FileUpload from "../../components/FileUpload/FileUpload";

const FileUploadPage = () => {
  const { exId } = useOutletContext(); // Get exId from parent layout

  return <FileUpload exId={exId} />;
};

export default FileUploadPage;