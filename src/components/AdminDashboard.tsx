import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  organization: string;
  location: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
}

export function AdminDashboard() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          admin_approvals (
            status,
            notes
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOpportunities = data.map((opp: any) => ({
        ...opp,
        status: opp.admin_approvals?.[0]?.status || 'pending',
        admin_notes: opp.admin_approvals?.[0]?.notes
      }));

      setOpportunities(formattedOpportunities);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (opportunityId: string) => {
    try {
      const { error } = await supabase
        .from('admin_approvals')
        .upsert({
          opportunity_id: opportunityId,
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'approved',
          notes: adminNotes
        });

      if (error) throw error;

      setOpportunities(prev =>
        prev.map(opp =>
          opp.id === opportunityId
            ? { ...opp, status: 'approved', admin_notes: adminNotes }
            : opp
        )
      );

      toast.success('Opportunity approved successfully');
      setSelectedOpportunity(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving opportunity:', error);
      toast.error('Failed to approve opportunity');
    }
  };

  const handleReject = async (opportunityId: string) => {
    try {
      const { error } = await supabase
        .from('admin_approvals')
        .upsert({
          opportunity_id: opportunityId,
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'rejected',
          notes: adminNotes
        });

      if (error) throw error;

      setOpportunities(prev =>
        prev.map(opp =>
          opp.id === opportunityId
            ? { ...opp, status: 'rejected', admin_notes: adminNotes }
            : opp
        )
      );

      toast.success('Opportunity rejected');
      setSelectedOpportunity(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting opportunity:', error);
      toast.error('Failed to reject opportunity');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.map((opportunity) => (
            <TableRow key={opportunity.id}>
              <TableCell>{opportunity.title}</TableCell>
              <TableCell>{opportunity.organization}</TableCell>
              <TableCell>{opportunity.location}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  opportunity.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : opportunity.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {opportunity.status}
                </span>
              </TableCell>
              <TableCell>
                {new Date(opportunity.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedOpportunity(opportunity);
                    setAdminNotes(opportunity.admin_notes || '');
                  }}
                >
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedOpportunity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full space-y-4">
            <h3 className="text-xl font-bold">{selectedOpportunity.title}</h3>
            <p className="text-muted-foreground">
              {selectedOpportunity.description}
            </p>
            <Textarea
              placeholder="Add admin notes..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedOpportunity(null);
                  setAdminNotes('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(selectedOpportunity.id)}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(selectedOpportunity.id)}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 