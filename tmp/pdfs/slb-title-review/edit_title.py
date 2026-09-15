from pathlib import Path
import sys

import pymupdf


OLD_TITLE = "Software Engineer Intern"
NEW_TITLE = "Software Engineer Intern (Data Automation)"


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: edit_title.py INPUT.pdf OUTPUT.pdf")

    source = Path(sys.argv[1]).resolve()
    output = Path(sys.argv[2]).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)

    doc = pymupdf.open(source)
    matches: list[tuple[int, pymupdf.Rect]] = []
    for page_number, page in enumerate(doc):
        for rect in page.search_for(OLD_TITLE):
            matches.append((page_number, rect))

    if len(matches) != 1:
        raise RuntimeError(f"Expected exactly one title occurrence, found {len(matches)}")

    page_number, rect = matches[0]
    page = doc[page_number]

    # Remove the original text content, then redraw the replacement at the
    # original baseline using the same Arial Bold face, size, and dark-gray color.
    redact_rect = pymupdf.Rect(rect.x0 - 0.5, rect.y0 - 0.5, rect.x1 + 0.5, rect.y1 + 0.5)
    page.add_redact_annot(redact_rect, fill=(1, 1, 1))
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE)

    # Helvetica Bold is metrically close to the embedded Arial Bold and keeps
    # ordinary ASCII spaces in extracted text for ATS compatibility.
    font_name = "hebo"
    inserted = page.insert_text(
        (rect.x0, 169.5),
        NEW_TITLE,
        fontsize=8.25,
        fontname=font_name,
        color=(0.2, 0.2, 0.2),
        overlay=True,
    )
    if inserted < 0:
        raise RuntimeError("Replacement title did not fit")

    doc.set_metadata({**doc.metadata, "modDate": pymupdf.get_pdf_now()})
    doc.save(output, garbage=4, deflate=True)
    doc.close()

    check = pymupdf.open(output)
    lines = [line.strip() for page in check for line in page.get_text().splitlines()]
    if lines.count(NEW_TITLE) != 1 or lines.count(OLD_TITLE) != 0:
        raise RuntimeError("Saved PDF failed title text validation")
    if check.page_count != 2:
        raise RuntimeError(f"Unexpected page count: {check.page_count}")
    check.close()


if __name__ == "__main__":
    main()
