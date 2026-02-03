export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    longDescription?: string;
    image: string;
    features?: string[];
    specs?: Record<string, string>;
}

export const SAMPLE_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Neural Processor X1',
        price: 150000,
        category: 'Hardware',
        description: 'Advanced AI-optimized processor with institutional-grade parallelism.',
        longDescription: 'The Neural Processor X1 represents the pinnacle of silicon engineering. Designed for next-generation AI workloads, it features 16,384 tensor cores and on-die high-bandwidth memory, making it the perfect choice for edge inference and real-time learning applications.',
        image: '/images/processor.jpg',
        features: [
            '16,384 Tensor Cores',
            '128GB HBM3e Memory',
            'Quantum-Safe Security Enclave',
            'Passive Cryo-Cooling Architecture'
        ],
        specs: {
            'Architecture': 'Neuromorphic V9',
            'TDP': '350W',
            'Process': '2nm Angstrom',
            'Interface': 'PCIe Gen 6.0'
        }
    },
    {
        id: '2',
        name: 'Quantum Flux Capacitor',
        price: 2500000,
        category: 'Energy',
        description: 'High-density energy stabilization unit for large-scale data center nodes.',
        longDescription: 'Stabilize your temporal and electrical fields with the Enterprise-Grade Flux Capacitor. Essential for limiting voltage spikes in quantum computing arrays and maintaining coherence strictly within the Planck time.',
        image: '/images/flux.jpg',
        features: [
            '1.21 Gigawatts Output',
            'Zero-Point Energy Extraction',
            'Temporal Shielding Class A',
            'Hot-Swappable Core'
        ],
        specs: {
            'Output': '1.21 GW',
            'Efficiency': '99.9999%',
            'Cooling': 'Liquid Helium',
            'Warranty': '100 Years'
        }
    },
    {
        id: '3',
        name: 'Cybernetic Neural Link',
        price: 450000,
        category: 'Interface',
        description: 'Direct cortical interface module for high-bandwidth bio-digital synchronization.',
        longDescription: 'Merge mind and machine. The Cybernetic Neural Link provides a lag-free, high-bandwidth connection between your biological cortex and digital infrastructure. Fully compatible with standard USB-C and Neural-Link v4 protocols.',
        image: '/images/link.jpg',
        features: [
            'Bi-directional BCI',
            'Sub-1ms Latency',
            'Auto-Calibration AI',
            'Hypoallergenic Titanium Casing'
        ],
        specs: {
            'Bandwidth': '40 Tbps',
            'Latency': '< 1ms',
            'Interface': 'Direct Cortical',
            'Material': 'Bio-Titanium'
        }
    },
    {
        id: '4',
        name: 'Holographic Display Module',
        price: 85000,
        category: 'Visuals',
        description: 'Crystal-clear 4D holographic projection unit with haptic-light interaction.',
        longDescription: 'Experience data in true spatial dimensions. This module projects high-fidelity, touch-responsive 4D holograms, allowing you to manipulate complex data structures with your bare hands. Perfect for engineering and architectural visualization.',
        image: '/images/hologram.jpg',
        features: [
            '8K Volumetric Resolution',
            'Haptic Feedback Fields',
            '170-degree Field of View',
            'Gesture Recognition'
        ],
        specs: {
            'Resolution': '7680x4320 Volumetric',
            'Brightness': '5000 Nits',
            'Input': 'Gesture/Voice',
            'Power': 'Wireless Induction'
        }
    }
];

export function getProduct(id: string): Product | undefined {
    return SAMPLE_PRODUCTS.find(p => p.id === id);
}
