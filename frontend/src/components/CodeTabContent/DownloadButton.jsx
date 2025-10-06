import "./DownloadButton.css";
import { MdDownload } from "react-icons/md";
import SolidButton from "../buttons/Solid/SolidButton";
import { downloadHTMLFile } from "../../utils/codeUtils";
import { useUserAnalytics } from "../../hooks/useUserAnalytics";

const DownloadButton = ({ processedHTML, exId }) => {
  const { logExerciseFileDownloaded } = useUserAnalytics();

  const handleDownload = async () => {
    // Download the file
    downloadHTMLFile(processedHTML, exId);
    
    // Log the download action with the code
    if (exId && processedHTML) {
      try {
        await logExerciseFileDownloaded(exId, processedHTML);
        console.log('Exercise file download logged:', exId);
      } catch (error) {
        console.error('Error logging exercise file download:', error);
      }
    }
  };

  return (
    <div className="download-html-container">
      <SolidButton 
        onClick={handleDownload}
        disabled={!processedHTML || processedHTML.length === 0}
      >
        <MdDownload size={20} style={{ marginRight: "5px" }} />
        Download HTML
      </SolidButton>
    </div>
  );
};

export default DownloadButton;