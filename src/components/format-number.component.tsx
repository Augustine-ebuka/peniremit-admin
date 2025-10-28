import FloatComponent from "./float.component";

export function FormatNumber({
    value,
    currency = "",
}: {
    value: number;
    currency?: string;
}) {
    if (value >= 1) {
        let formattedValue = currency;
        const formatter = new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 2,
        });

        if (value >= 1e15) {
            formattedValue += formatter.format(value / 1e15) + "Qd"; // Quadrillions
        } else if (value >= 1e12) {
            formattedValue += formatter.format(value / 1e12) + "T"; // Trillions
        } else if (value >= 1e9) {
            formattedValue += formatter.format(value / 1e9) + "B"; // Billions
        } else if (value >= 1e6) {
            formattedValue += formatter.format(value / 1e6) + "M"; // Millions
        } else if (value >= 1e3) {
            formattedValue += formatter.format(value / 1e3) + "K"; // Thousands
        } else {
            formattedValue += formatter.format(value);
        }

        return <span>{formattedValue}</span>;
    } else {
        return (
            <>
                {currency}
                <FloatComponent value={value} />
            </>
        );
    }
}
