
import React from "react";
import { useOutletContext } from "react-router-dom";
import InsertCode from "../../components/InsertCode/InsertCode";
import { useCodeProcessor } from "../../hooks/useCodeProcessor";

const InsertCodePage = () => {
  const { exId } = useOutletContext();
  
  // Create a code processor just for reading existing code
  const codeProcessor = useCodeProcessor(null, exId);
  
  return <InsertCode codeProcessor={codeProcessor} />;
};

export default InsertCodePage;