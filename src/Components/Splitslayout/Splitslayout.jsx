const SplitLayout = ({ children, quotationPreview }) => {
    return (
      <div className="split-container">
        <div className="form-side">
          {children}
        </div>
        <div className="preview-side">
          {quotationPreview}
        </div>
      </div>
    );
  };

export default SplitLayout;