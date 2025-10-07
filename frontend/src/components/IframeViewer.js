import React from 'react';

const IframeViewer = ({
    src,
    title = "Iframe Content",
    width = "100%",
    height = "500px",
    allowFullScreen = true,
    className = ""
}) => {
    return (
        <div className={`iframe-container ${className}`}>
            <iframe
                src={src}
                title={title}
                width={width}
                height={height}
                allowFullScreen={allowFullScreen}
                className="border rounded-lg shadow-md w-full"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            />
        </div>
    );
};

export default IframeViewer;