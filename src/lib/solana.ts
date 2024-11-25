export * from './solana/connection';
export * from './solana/transactions';
export * from './solana/account';

export const processTransactionsForGraph = (transactions: any[]) => {
  const nodes = new Map();
  const links = new Map();

  transactions.forEach((tx) => {
    if (!tx.from || !tx.to) return;

    // Add nodes with improved visual properties
    if (!nodes.has(tx.from)) {
      nodes.set(tx.from, {
        id: tx.from,
        name: `${tx.from.slice(0, 4)}...${tx.from.slice(-4)}`,
        val: 3,
        color: "#9945FF"
      });
    } else {
      const node = nodes.get(tx.from);
      node.val += 1;
      nodes.set(tx.from, node);
    }

    if (!nodes.has(tx.to)) {
      nodes.set(tx.to, {
        id: tx.to,
        name: `${tx.to.slice(0, 4)}...${tx.to.slice(-4)}`,
        val: 3,
        color: "#14F195"
      });
    } else {
      const node = nodes.get(tx.to);
      node.val += 1;
      nodes.set(tx.to, node);
    }

    const linkId = `${tx.from}-${tx.to}`;
    if (!links.has(linkId)) {
      links.set(linkId, {
        source: tx.from,
        target: tx.to,
        value: tx.amount || 1,
      });
    } else {
      const link = links.get(linkId);
      link.value += tx.amount || 1;
      links.set(linkId, link);
    }
  });

  return {
    nodes: Array.from(nodes.values()),
    links: Array.from(links.values()),
  };
};