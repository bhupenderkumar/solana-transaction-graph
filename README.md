# Solana Transaction Graph Visualizer 

An interactive web application for exploring and visualizing Solana blockchain transactions with real-time graph visualization capabilities.

![Solana Transaction Graph](public/preview.jpg)

## Features 

- **Interactive Transaction Graph**: Visualize transaction relationships between Solana addresses
- **Real-time Updates**: Track new transactions as they happen on the network
- **Advanced Search**: Search for any Solana address and explore its transaction history
- **Transaction Details**: View detailed information about each transaction
- **Account Information**: See balance and other account details
- **Network Activity**: Monitor recent network transactions in real-time

## Tech Stack 

- **Frontend Framework**: React + TypeScript + Vite
- **Blockchain Integration**: @solana/web3.js
- **Graph Visualization**: react-force-graph-2d
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: React Query
- **Date Handling**: date-fns
- **Routing**: React Router DOM

## Getting Started 

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bhupenderkumar/solana-transaction-graph.git
cd solana-transaction-graph
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure 

```
solana-transaction-graph/
├── src/
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and Solana integration
│   ├── pages/              # Page components
│   └── styles/             # Global styles and Tailwind config
├── public/                 # Static assets
└── package.json           # Project dependencies and scripts
```

## Key Components 

- **TransactionGraph**: Interactive visualization of transaction relationships
- **SearchBar**: Address search with network selection
- **TransactionTable**: Detailed transaction history display
- **TransactionTracker**: Real-time transaction monitoring
- **AccountMetadata**: Account information display

## Features in Detail 

### Transaction Graph
- Dynamic node sizing based on transaction volume
- Color-coded nodes for different transaction types
- Interactive node selection and navigation
- Smooth animations and transitions

### Transaction Processing
- Support for various transaction types
- Real-time data updates
- Efficient data parsing and processing
- Error handling and retry mechanisms

### User Interface
- Responsive design for all screen sizes
- Dark/Light theme support
- Loading states and error handling
- Modern and clean UI

## Development 

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SOLANA_RPC_URL=your_rpc_url_here
```

## Contributing 

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 

- [Solana Web3.js](https://github.com/solana-labs/solana-web3.js)
- [React Force Graph](https://github.com/vasturiano/react-force-graph)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## Support 

For support, please open an issue in the GitHub repository or contact the maintainers.
