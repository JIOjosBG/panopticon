'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Search, Building2, Clock, Filter, Mail, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Newsletter {
  id: number;
  title: string;
  company: string;
  description: string;
  frequency: 'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly';
  posted: string;
  tags: string[];
  promotions: boolean;
  subscribers: number;
  averageReadTime: string;
  price: {
    value: number;
    currency: string;
    period: 'month' | 'year' | null;
  } | 'Free';
}

const newsletters: Newsletter[] = [
  {
    id: 1,
    title: 'Web3 Weekly Insights',
    company: 'CryptoTech News',
    description: 'Deep dives into web3 developments, cryptocurrency trends, and blockchain technology.',
    frequency: 'Weekly',
    posted: '2 days ago',
    tags: ['Web3', 'Crypto', 'Blockchain'],
    promotions: false,
    subscribers: 15000,
    averageReadTime: '10 min',
    price: 'Free'
  },
  {
    id: 2,
    title: 'DeFi Daily Digest',
    company: 'DeFi Pulse',
    description: 'Latest updates in decentralized finance, yield farming, and liquidity pools.',
    frequency: 'Daily',
    posted: '1 day ago',
    tags: ['DeFi', 'Trading', 'Finance'],
    promotions: true,
    subscribers: 25000,
    averageReadTime: '5 min',
    price: {
      value: 10,
      currency: 'USD',
      period: 'month'
    }
  },
  {
    id: 3,
    title: 'NFT Market Analysis',
    company: 'NFT Insights',
    description: 'Comprehensive analysis of NFT markets, upcoming drops, and artist spotlights.',
    frequency: 'Bi-weekly',
    posted: '3 days ago',
    tags: ['NFT', 'Art', 'Markets'],
    promotions: false,
    subscribers: 8000,
    averageReadTime: '15 min',
    price: {
      value: 99,
      currency: 'USD',
      period: 'year'
    }
  }
];

const NewsletterBoard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const { toast } = useToast()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

    // Check if there is a web3 wallet installed
    const checkIfWalletIsConnected = async () => {
      try {
        const { ethereum } = window as any;
        
        if (!ethereum) {
          toast({
            title: "Web3 wallet not found",
            description: "Please install a web3 browser extension",
            variant: "destructive",
          });
          return false;
        }
  
        // Check if we're authorized to access the user's wallet
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length !== 0) {
          const account = accounts[0];
          setWalletAddress(account);
          setIsConnected(true);
          return true;
        } else {
          setIsConnected(false);
          return false;
        }
      } catch (error) {
        console.error(error);
        return false;
      }
    };
  
    // Connect wallet handler
    const connectWallet = async () => {
      try {
        setIsConnecting(true);
        const { ethereum } = window as any;
  
        if (!ethereum) {
          toast({
            title: "MetaMask not found",
            description: "Please install MetaMask browser extension",
            variant: "destructive",
          });
          return;
        }
  
        // Request account access
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts',
        });
  
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to MetaMask",
        });
        
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsConnecting(false);
      }
    };
  
    // Handle newsletter subscription
    const handleSubscribe = async (newsletterId: number) => {
      connectWallet();
      if (!isConnected) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }
  
      try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
  
        toast({
          title: "Subscription Initiated",
          description: "Please confirm the transaction in MetaMask",
        });
  
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Subscription Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    };
  
    // Check wallet connection on component mount
    useEffect(() => {
      checkIfWalletIsConnected();
    }, []);

  const formatPrice = (price: Newsletter['price']): string => {
    if (price === 'Free') return 'Free';
    return `${price.currency} ${price.value}/${price.period}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Discover Web3 Newsletters</h1>
        <p className="text-gray-600">Stay informed with the latest insights in blockchain and crypto</p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search newsletters, topics, or publishers..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Newsletter Listings */}
      <div className="space-y-4">
        {newsletters.map((newsletter: Newsletter) => (
          <Card key={newsletter.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{newsletter.title}</h2>
                  <p className="text-gray-600 mb-4">{newsletter.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="h-4 w-4" />
                      {newsletter.company}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      {newsletter.frequency}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      {newsletter.subscribers.toLocaleString()} subscribers
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      {newsletter.averageReadTime} read
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:text-right flex flex-col items-end">
                  <div className="text-lg font-semibold text-green-600 mb-2">
                    {formatPrice(newsletter.price)}
                  </div>
                  <Button 
                    className="mb-4 w-32"
                    onClick={() => handleSubscribe(newsletter.id)}
                  >
                    Subscribe
                  </Button>
                  {newsletter.promotions && (
                    <Badge variant="secondary" className="mb-4">
                      Promoted
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {newsletter.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NewsletterBoard;