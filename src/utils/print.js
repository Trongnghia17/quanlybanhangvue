export function printHtmlContent(htmlContent) {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  iframe.contentDocument.write(htmlContent);
  iframe.contentDocument.close();
  iframe.contentWindow.print();
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
}
