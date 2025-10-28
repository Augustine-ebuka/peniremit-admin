import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface PaginationProps {
    meta: {
        total: number;
        lastPage: number;
    };
    page: number;
    limit: number;
    onPageChange: (page: number, limit: number) => void;
}

function createRangeArray(currentPage: number, limit: number, total: number) {
    const itemsPerPage = limit;
    const totalPages = Math.ceil(total / itemsPerPage);
    const startPage = 1;
    const endPage = totalPages;
    const pages: { label: string; value: number }[] = [];

    if (totalPages === 0) return pages;

    const start = Math.max(currentPage - 2, startPage);
    for (let i = start; i <= currentPage; i++) {
        pages.push({ label: i.toString(), value: i });
    }

    const end = Math.min(currentPage + 2, endPage);
    for (let i = currentPage + 1; i <= end; i++) {
        pages.push({ label: i.toString(), value: i });
    }

    if (pages.length === 0) return pages;

    if (pages[0].value !== 1)
        pages.unshift({ label: `First page - 1`, value: 1 });

    if (pages[pages.length - 1].value !== totalPages)
        pages.push({
            label: `Last page - ${totalPages}`,
            value: totalPages,
        });

    return pages;
}

const PaginationComponent: React.FC<PaginationProps> = ({
    meta,
    page,
    limit,
    onPageChange,
}) => {
    const { total, lastPage } = meta;

    const pageNumbers = createRangeArray(page, limit, total);

    if (pageNumbers.length === 0) return null;

    return (
        <nav className="flex justify-start items-center mt-8 gap-2">
            <button
                onClick={() => onPageChange(page - 1, limit)}
                disabled={page === 1}
                className={`p-3 py-4 rounded-md flex items-center gap-2 border-dark border pr-5 md:border-none ${
                    page === 1
                        ? "text-neutral cursor-not-allowed"
                        : "text-white hover:bg-dark/50"
                }`}
            >
                <ChevronLeft size={16} />
                <span className="md:hidden">Prev</span>
            </button>

            {pageNumbers.map((currentPage) => (
                <button
                    key={currentPage.value}
                    onClick={() => onPageChange(currentPage.value, limit)}
                    className={`px-4 py-3 text-sm rounded-md hover:bg-dark/50 hidden md:block ${
                        currentPage.value === page
                            ? "text-white bg-dark"
                            : "text-neutral-400"
                    }`}
                >
                    {currentPage.label}
                </button>
            ))}

            <button
                onClick={() => onPageChange(page + 1, limit)}
                disabled={page === lastPage}
                className={`p-3 py-4 rounded-md flex items-center gap-2 border-dark border pl-5 md:border-none ${
                    page === lastPage
                        ? "text-neutral cursor-not-allowed"
                        : "text-white hover:bg-dark/50"
                }`}
            >
                <span className="md:hidden">Next</span>
                <ChevronRight size={16} />
            </button>
        </nav>
    );
};

export default PaginationComponent;
