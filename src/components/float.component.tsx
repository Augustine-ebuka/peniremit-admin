import React from "react";

const FloatComponent: React.FC<{ value: number }> = ({ value }) => {
    if (value === 0) {
        return <span>0</span>;
    }

    const [integerPart, fractionalPart] = value.toFixed(18).split(".");
    const significantIndex = fractionalPart.search(/[1-9]/);

    if (significantIndex === -1) {
        return <span>{integerPart}</span>;
    }

    const leadingZeros = fractionalPart.slice(0, significantIndex);
    const significantPart = fractionalPart
        .slice(significantIndex)
        .replace(/0+$/, "");

    return (
        <span>
            {integerPart}.0
            {leadingZeros.length > 0 && (
                <span style={{ verticalAlign: "sub", fontSize: "0.8em" }}>
                    {leadingZeros.length}
                </span>
            )}
            {significantPart.slice(0, 4)}
        </span>
    );
};

export default FloatComponent;
