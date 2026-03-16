export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  // Row 0 = background image group, Row 1 = text content group
  const bgCell = rows[0].querySelector(':scope > div');
  const contentCell = rows[1].querySelector(':scope > div');

  // Flatten rows into direct children for simpler layout
  while (block.firstChild) block.removeChild(block.firstChild);

  if (bgCell) {
    bgCell.classList.add('hero-careers-bg');
    block.appendChild(bgCell);
  }

  if (contentCell) {
    contentCell.classList.add('hero-careers-content');
    block.appendChild(contentCell);

    // Add the RL signature image only when hero has a quote (em element)
    if (contentCell.querySelector('em')) {
      const sig = document.createElement('img');
      sig.src = 'https://careers.ralphlauren.com/portal/4/images/home/RL_signature.png';
      sig.alt = 'Ralph Lauren Signature';
      sig.width = 224;
      sig.height = 48;
      sig.loading = 'lazy';
      sig.classList.add('hero-careers-signature');
      contentCell.appendChild(sig);
    }
  }
}
