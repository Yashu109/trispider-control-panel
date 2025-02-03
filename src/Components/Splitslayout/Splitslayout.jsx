import './Splitslayout.css'
const SplitLayout = ({ children, quotationPreview }) => {
    return (
      <div className="sidebar-split-container">
        <div className="sidebar-form-side">
          {children}
        </div>
        <div className="split-preview-side">
          {quotationPreview}
        </div>
      </div>
    );
  };

export default SplitLayout;