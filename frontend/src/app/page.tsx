'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Search, Building2, Clock, Filter, Mail, Users } from 'lucide-react';
import { IExecDataProtector, type ProtectDataParams } from '@iexec/dataprotector';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { grantAccess } from '@/lib/iexec';
import { postNewsletterName, checkCurrentChain } from '@/lib/utils';
import bannerImage from '../components/ui/banner.png'; // Tell webpack this JS file uses this image
import panopticonTitle from '../components/ui/panopticon.svg'; // Tell webpack this JS file uses this image
import Image from 'next/image'
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

interface Newsletters{
  [name: string]: {
    feedUrl: string,
    image: {
    link: string,
    url: string,
    title: string
    },
    title: string,
    description: string,
    generator: string,
    link: string,
    language: string,
    lastBuildDate: string
  }
}

const { ethereum } = window as any;
const iExecDataProtectorClient = new IExecDataProtector(ethereum);

const NewsletterBoard: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [newsletters, setNewsletters] = useState<Newsletters>({});
  const [subscriptions, setSubcriptions] = useState<string[]>([]);
  // email
  const [email, setEmail] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // protectData()
  const [protectedDataAddress, setProtectedDataAddress] = useState('');
  const [isLoadingProtectData, setIsLoadingProtectData] = useState(false);
  const [protectDataSuccess, setProtectDataSuccess] = useState(false);

  const { toast } = useToast()

  useEffect(()=>{
    fetch('http://localhost:3001/').then(r=>r.json()).then(r=>{
      console.log(r)
      setNewsletters(r)
    }).catch(console.log)
  },[])

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
  const handleSubscribe = async (newsletterName: string) => {
    connectWallet();
    if (email === '') {
      setIsDialogOpen(true);
      return;
    }
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

      await protectData();
      const grantedAccess = await grantAccess(protectedDataAddress, ethereum);

      await postNewsletterName(walletAddress, newsletterName, protectedDataAddress);
      
      setSubcriptions(subscriptions.concat(newsletterName));
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

  const protectData = async () => {
    setErrorMessage('');
    try {
      checkIfWalletIsConnected();
    } catch (err) {
      setErrorMessage('Please install MetaMask');
      return;
    }
    await checkCurrentChain();
    try {
      setProtectDataSuccess(false);
      setIsLoadingProtectData(true); // Show loader
      const protectedDataResponse =
        await iExecDataProtectorClient.core.protectData({
          data: {
            email: email || '',
          },
          name: 'DataProtector Panopticon - Email protected',
        });
      console.log('protectedDataResponse', protectedDataResponse);

      setProtectedDataAddress(protectedDataResponse.address);
      setIsLoadingProtectData(false); // hide loader
      setProtectDataSuccess(true); // show success icon
    } catch (e) {
      setIsLoadingProtectData(false); // hide loader
      console.error(e);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      setIsDialogOpen(false);
    } else {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: Newsletter['price']): string => {
    if (price === 'Free') return 'Free';
    return `${price.currency} ${price.value}/${price.period}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Image
        alt="Panopticon"
        src={panopticonTitle}
        className="pb-4"
      
      />
      <div className="absolute top-[591px] left-[1229px] rounded-31xl bg-khaki flex flex-row items-end justify-end py-space-050 px-space-200 text-right text-xs text-gray-200">
        <div className="relative leading-[20px]">Promoted</div>
      </div>
        <Image
          className="pb-4"
          alt=""
          src={bannerImage}
        />
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
      <div className="grid grid-cols-2 gap-4">
        {Object.keys(newsletters).length && Object.values(newsletters).map((newsletter) => (

          <Card key={newsletter.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col-6 md:flex-row justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2 text-gray-600">{newsletter.title}</h2>
                  {/* <Image alt="asd" width={300}  height={300} src={newsletter.image?.url}/> */}
                  <p className="text-gray-600 text-sm mb-4">{newsletter.description.slice(0,150)}{newsletter.description.length>100 && '...'}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="h-4 w-4" />
                        Tech news
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      Weekly
                      {/* {newsletter.frequency} */}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      100k subscribers
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      {/* {newsletter.averageReadTime} read */}
                      read time
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:text-right flex flex-col items-end">
                  <div className="text-sm font-semibold text-teal-400 mb-2">
                    FREE
                    {/* {formatPrice(newsletter.price)} */}
                  </div>
                  {subscriptions.includes(newsletter.title) ? (
                    <Button 
                      className="mb-4 bg-amber-950  w-32"
                      size={'sm'}
                      variant="secondary"  // or any other variant you prefer for subscribed state
                      disabled
                    >
                      Subscribed
                    </Button>
                  ) : (
                    <Button 
                      className="mb-4 bg-amber-950 w-32"
                      size={'sm'}
                      onClick={() => handleSubscribe(newsletter.title)}
                    >
                      Subscribe
                    </Button>
                  )}
                  
                  <Badge variant="secondary" className="bg-yellow-200 mb-4">
                    Promoted
                  </Badge>
                  
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {['crypto','web3', 'finance'].map((tag: string) => (
                  <Badge key={tag} className="bg-gray-100 text-gray-400" variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter your email</DialogTitle>
            <DialogDescription>
              Your email will be securely encrypted. No other parties will have access to it.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit}>
            <div className="grid gap-4 py-4">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster/>
    </div>
  );
};

export default NewsletterBoard;