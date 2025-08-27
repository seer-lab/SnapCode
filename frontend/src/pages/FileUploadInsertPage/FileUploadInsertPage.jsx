
import React from "react";
import { useOutletContext } from "react-router-dom";
import FileUploadInsert from "../../components/FileUploadinsert/FileUploadInsert";

const FileUploadInsertPage = () => {
  const { exId } = useOutletContext();
  return <FileUploadInsert exId={exId} />;
};

export default FileUploadInsertPage;