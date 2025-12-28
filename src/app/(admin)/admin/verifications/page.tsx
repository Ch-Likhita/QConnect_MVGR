'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, functions } from '../../../../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../hooks/useAuth';

export default function VerificationQueue() {
  const [requests, setRequests] = useState<any[]>([]);
  const { userProfile } = useAuth();
  
  useEffect(() => {
    if (userProfile?.role !== 'admin') return;
    const fetchRequests = async () => {
      const q = query(collection(db, 'verificationRequests'), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setRequests(list);
    };
    fetchRequests();
  }, [userProfile]);

  const handleApprove = async (userId: string) => {
    try {
      const approveFn = httpsCallable(functions, 'verification-approveVerification');
      await approveFn({ userId });
      setRequests(requests.filter(r => r.userId !== userId));
      alert("Approved");
    } catch(e) { console.error(e); alert("Error"); }
  };

  const handleReject = async (userId: string) => {
    try {
       const rejectFn = httpsCallable(functions, 'verification-rejectVerification');
       await rejectFn({ userId });
       setRequests(requests.filter(r => r.userId !== userId));
       alert("Rejected");
    } catch(e) { console.error(e); alert("Error"); }
  };

  if (!userProfile || userProfile.role !== 'admin') return <div className="p-8">Access Denied</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
       <h1 className="text-2xl font-bold mb-6">Pending Verifications</h1>
       {requests.length === 0 ? (
         <p>No pending requests.</p>
       ) : (
         <div className="bg-white shadow overflow-hidden sm:rounded-md">
           <ul className="divide-y divide-gray-200">
             {requests.map((req) => (
               <li key={req.id} className="p-6">
                 <div className="flex justify-between">
                   <div>
                     <h3 className="text-lg font-medium text-indigo-600">User ID: {req.userId}</h3>
                     <div className="mt-2 text-sm text-gray-700">
                       <p><strong>Qualification:</strong> {req.submittedData.qualification}</p>
                       <p><strong>Experience:</strong> {req.submittedData.experience}</p>
                       <p><strong>Links:</strong> {req.submittedData.proofLinks?.join(', ')}</p>
                     </div>
                   </div>
                   <div className="flex items-start space-x-3">
                     <button onClick={() => handleApprove(req.userId)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                     <button onClick={() => handleReject(req.userId)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
                   </div>
                 </div>
               </li>
             ))}
           </ul>
         </div>
       )}
    </div>
  );
}