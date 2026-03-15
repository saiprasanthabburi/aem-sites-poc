export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cols = [...row.children];
  if (cols.length < 2) return;

  // Column 1 = background image, Column 2 = text content
  cols[0].classList.add('hero-careers-bg');
  cols[1].classList.add('hero-careers-content');

  // Add the RL signature image only when hero has a quote (em element)
  if (cols[1].querySelector('em')) {
    const sig = document.createElement('img');
    sig.src = './RL_signature.png';
    sig.alt = 'Ralph Lauren Signature';
    sig.width = 224;
    sig.height = 48;
    sig.loading = 'lazy';
    sig.classList.add('hero-careers-signature');
    cols[1].appendChild(sig);
  }
}
