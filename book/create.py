
import os
import subprocess

from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration


title = os.environ.get('BOOK_TITLE', 'Abolish the Jesus Trade')
slug = title.replace(' ', '-')


def create_pdf():
    font_config = FontConfiguration()
    weasy_html = HTML(filename='shared/dist_pdf/book.html')
    weasy_css = CSS(filename='shared/dist_pdf/book.css', font_config=font_config)
    weasy_doc = weasy_html.render(stylesheets=[weasy_css], font_config=font_config)
    weasy_doc.write_pdf('shared/book_pre_gs.pdf')
    # Amazon KDP has issues with the encoding of fonts
    # This fixes it somehow, and still seems to ensure greek fonts only for greek text, etc.
    subprocess.run([
        'gs',
        '-sDEVICE=pdfwrite',
        '-dEmbedAllFonts=true',
        '-dPDFSETTINGS=/prepress',
        '-dNOPAUSE',
        '-dBATCH',
        f'-sOutputFile=shared/{slug}.pdf',
        'shared/book_pre_gs.pdf',
    ], check=True)


def create_epub():
    subprocess.run(
        [
            'ebook-convert', 'book.html', f'../{slug}.epub',
            # Add metadata
            '--title', title,
            '--authors', "Andrew Case & Conley Owens & Jon Here",
            '--cover', 'epub_cover.jpg',
            # Include custom stylesheet
            '--extra-css', 'book.css',
            # Treat h1 as chapter groups and h2 as chapters
            '--chapter', '//h:h2',
            '--level1-toc', '//h:h1',
            '--level2-toc', '//h:h2',
            # Prevent Calibre from unhelpfully changing font-sizes (even em units)
            '--disable-font-rescaling',
        ],
        cwd='shared/dist_epub',
        check=True,
    )


create_epub()
create_pdf()
