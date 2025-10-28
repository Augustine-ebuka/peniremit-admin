import React, { useState } from "react";

interface ImageComponentProps {
    src: string;
    alt: string;
    className?: string;
    useDefaultImage?: boolean;
}

const ImageComponent: React.FC<ImageComponentProps> = ({
    src,
    alt,
    className,
    useDefaultImage = false,
}) => {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <img
            src={
                imgSrc ||
                "https://ui-avatars.com/api/?background=random&name=" + alt
            }
            alt={alt}
            onError={() =>
                setImgSrc(
                    useDefaultImage
                        ? "/assets/images/default.png"
                        : "https://ui-avatars.com/api/?background=random&name=" +
                              alt,
                )
            }
            className={`object-cover object-center ${className || ""}`}
        />
    );
};

export default ImageComponent;
