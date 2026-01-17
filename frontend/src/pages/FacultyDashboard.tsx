// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Card } from '@/components/Card';
// import { Users, Calendar, AlertTriangle, TrendingUp, Download } from 'lucide-react';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
// } from 'recharts';
// import { db } from '@/config/firebase';
// import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// interface AttendanceRecord {
//   id: string;
//   userId: string;
//   studentName: string;
//   studentEmail: string;
//   timestamp: any;
//   confidenceScore: number;
//   status: 'approved' | 'rejected' | 'flagged';
//   similarityMetrics?: {
//     overall: number;
//     typingRhythm: number;
//     keyDynamics: number;
//     mouseDynamics: number;
//   };
// }

// export const FacultyDashboard: React.FC = () => {
//   const [records, setRecords] = useState<AttendanceRecord[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadAttendanceData();
//   }, []);

//   const loadAttendanceData = async () => {
//     try {
//       setLoading(true);

//       // Fetch attendance records from Firestore
//       const q = query(
//         collection(db, 'attendance_records'),
//         orderBy('timestamp', 'desc'),
//         limit(100)
//       );

//       const snapshot = await getDocs(q);

//       const fetchedRecords: AttendanceRecord[] = snapshot.docs.map(doc => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           userId: data.userId || '',
//           studentName: data.studentName || 'Unknown',
//           studentEmail: data.studentEmail || '',
//           timestamp: data.timestamp,
//           confidenceScore: data.confidenceScore || 0,
//           status: data.status || 'approved',
//           similarityMetrics: data.similarityMetrics,
//         };
//       });

//       setRecords(fetchedRecords);
//       console.log('✅ Loaded attendance records:', fetchedRecords.length);
//     } catch (error) {
//       console.error('Error loading attendance data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate analytics from real data
//   const totalStudents = new Set(records.map(r => r.userId)).size;
//   const avgAttendance = records.length > 0
//     ? ((records.filter(r => r.status === 'approved').length / records.length) * 100).toFixed(1)
//     : '0';
//   const flaggedCount = records.filter(r => r.status === 'rejected' || r.confidenceScore < 0.6).length;
//   const totalSessions = records.length;

//   // Prepare chart data from real records
//   const last7Days = Array.from({ length: 7 }, (_, i) => {
//     const date = new Date();
//     date.setDate(date.getDate() - (6 - i));
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//   });

//   const attendanceByDay = last7Days.map(day => {
//     const dayRecords = records.filter(r => {
//       if (!r.timestamp) return false;
//       const recordDate = r.timestamp.toDate();
//       const recordDay = recordDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//       return recordDay === day;
//     });

//     return {
//       date: day,
//       present: dayRecords.filter(r => r.status === 'approved').length,
//       absent: dayRecords.filter(r => r.status === 'rejected').length,
//     };
//   });

//   // Confidence distribution
//   const confidenceRanges = [
//     { name: '90-100%', value: records.filter(r => r.confidenceScore >= 0.9).length, color: '#10b981' },
//     { name: '75-90%', value: records.filter(r => r.confidenceScore >= 0.75 && r.confidenceScore < 0.9).length, color: '#3b82f6' },
//     { name: '60-75%', value: records.filter(r => r.confidenceScore >= 0.6 && r.confidenceScore < 0.75).length, color: '#f59e0b' },
//     { name: 'Below 60%', value: records.filter(r => r.confidenceScore < 0.6).length, color: '#ef4444' },
//   ];

//   const handleExport = () => {
//     const csvContent = [
//       ['Student Name', 'Email', 'Date', 'Time', 'Confidence Score', 'Status'],
//       ...records.map(r => [
//         r.studentName,
//         r.studentEmail,
//         r.timestamp ? r.timestamp.toDate().toLocaleDateString() : 'N/A',
//         r.timestamp ? r.timestamp.toDate().toLocaleTimeString() : 'N/A',
//         (r.confidenceScore * 100).toFixed(1) + '%',
//         r.status,
//       ]),
//     ].map(row => row.join(',')).join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
//           <p className="text-lg text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
//             Faculty Dashboard
//           </h1>
//           <p className="text-gray-600">Monitor attendance and behavioral verification metrics</p>
//         </motion.div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//           >
//             <Card variant="glass" className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600 mb-1">Total Students</p>
//                   <p className="text-3xl font-bold text-primary-600">{totalStudents}</p>
//                 </div>
//                 <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
//                   <Users className="w-6 h-6 text-primary-600" />
//                 </div>
//               </div>
//             </Card>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//           >
//             <Card variant="glass" className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600 mb-1">Avg Attendance</p>
//                   <p className="text-3xl font-bold text-green-600">{avgAttendance}%</p>
//                 </div>
//                 <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
//                   <TrendingUp className="w-6 h-6 text-green-600" />
//                 </div>
//               </div>
//             </Card>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//           >
//             <Card variant="glass" className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600 mb-1">Flagged Records</p>
//                   <p className="text-3xl font-bold text-orange-600">{flaggedCount}</p>
//                 </div>
//                 <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
//                   <AlertTriangle className="w-6 h-6 text-orange-600" />
//                 </div>
//               </div>
//             </Card>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//           >
//             <Card variant="glass" className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
//                   <p className="text-3xl font-bold text-accent-600">{totalSessions}</p>
//                 </div>
//                 <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
//                   <Calendar className="w-6 h-6 text-accent-600" />
//                 </div>
//               </div>
//             </Card>
//           </motion.div>
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//           {/* Attendance Trend */}
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.5 }}
//           >
//             <Card variant="glass" className="p-6">
//               <h3 className="text-lg font-semibold mb-4">Attendance Trend (Last 7 Days)</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={attendanceByDay}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//                   <XAxis dataKey="date" stroke="#666" />
//                   <YAxis stroke="#666" />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="present" fill="#10b981" name="Present" />
//                   <Bar dataKey="absent" fill="#ef4444" name="Absent" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </Card>
//           </motion.div>

//           {/* Confidence Distribution */}
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.6 }}
//           >
//             <Card variant="glass" className="p-6">
//               <h3 className="text-lg font-semibold mb-4">Confidence Score Distribution</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={confidenceRanges}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={({ name, value }) => `${name}: ${value}`}
//                     outerRadius={100}
//                     fill="#8884d8"
//                     dataKey="value"
//                   >
//                     {confidenceRanges.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </Card>
//           </motion.div>
//         </div>

//         {/* Recent Attendance Table */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.7 }}
//         >
//           <Card variant="glass" className="p-6">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-lg font-semibold">Recent Attendance</h3>
//               <button
//                 onClick={handleExport}
//                 className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
//               >
//                 <Download className="w-4 h-4" />
//                 Export CSV
//               </button>
//             </div>

//             {records.length === 0 ? (
//               <div className="text-center py-12 text-gray-500">
//                 <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
//                 <p className="text-lg font-medium mb-2">No attendance records yet</p>
//                 <p className="text-sm">Records will appear here as students mark attendance</p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b border-gray-200">
//                       <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
//                       <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
//                       <th className="text-left py-3 px-4 font-semibold text-gray-700">Confidence</th>
//                       <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {records.map((record) => (
//                       <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
//                         <td className="py-3 px-4">
//                           <div>
//                             <div className="font-medium text-gray-900">{record.studentName}</div>
//                             <div className="text-sm text-gray-500">{record.studentEmail}</div>
//                           </div>
//                         </td>
//                         <td className="py-3 px-4 text-gray-600">
//                           {record.timestamp
//                             ? `${record.timestamp.toDate().toLocaleDateString()} ${record.timestamp
//                               .toDate()
//                               .toLocaleTimeString()}`
//                             : 'N/A'}
//                         </td>
//                         <td className="py-3 px-4">
//                           <div className="flex items-center gap-2">
//                             <div className="flex-1 bg-gray-200 rounded-full h-2">
//                               <div
//                                 className={`h-2 rounded-full ${record.confidenceScore >= 0.75
//                                     ? 'bg-green-500'
//                                     : record.confidenceScore >= 0.6
//                                       ? 'bg-orange-500'
//                                       : 'bg-red-500'
//                                   }`}
//                                 style={{ width: `${record.confidenceScore * 100}%` }}
//                               />
//                             </div>
//                             <span className="text-sm font-medium text-gray-700">
//                               {(record.confidenceScore * 100).toFixed(1)}%
//                             </span>
//                           </div>
//                         </td>
//                         <td className="py-3 px-4">
//                           <span
//                             className={`px-3 py-1 rounded-full text-sm font-medium ${record.status === 'approved'
//                                 ? 'bg-green-100 text-green-800'
//                                 : record.status === 'rejected'
//                                   ? 'bg-red-100 text-red-800'
//                                   : 'bg-orange-100 text-orange-800'
//                               }`}
//                           >
//                             {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </Card>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/Card';
import { Users, Calendar, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { db } from '@/config/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

interface AttendanceRecord {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  timestamp: any;
  confidenceScore: number;
  status: 'approved' | 'rejected' | 'flagged';
  similarityMetrics?: {
    overall: number;
    typingRhythm: number;
    keyDynamics: number;
    mouseDynamics: number;
  };
}

export const FacultyDashboard: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to convert timestamp to Date (handles both ISO strings and Firestore Timestamps)
  const getDate = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    if (typeof timestamp === 'string') return new Date(timestamp);
    if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
    return null;
  };

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);

      // Fetch attendance records from Firestore
      const q = query(
        collection(db, 'attendance_records'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);

      const fetchedRecords: AttendanceRecord[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || '',
          studentName: data.studentName || 'Unknown',
          studentEmail: data.studentEmail || '',
          timestamp: data.timestamp,
          confidenceScore: data.confidenceScore || 0,
          status: data.status || 'approved',
          similarityMetrics: data.similarityMetrics,
        };
      });

      setRecords(fetchedRecords);
      console.log('✅ Loaded attendance records:', fetchedRecords.length);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics from real data
  const totalStudents = new Set(records.map(r => r.userId)).size;
  const avgAttendance = records.length > 0
    ? ((records.filter(r => r.status === 'approved').length / records.length) * 100).toFixed(1)
    : '0';
  const flaggedCount = records.filter(r => r.status === 'rejected' || r.confidenceScore < 0.6).length;
  const totalSessions = records.length;

  // Prepare chart data from real records
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const attendanceByDay = last7Days.map(day => {
    const dayRecords = records.filter(r => {
      const recordDate = getDate(r.timestamp);
      if (!recordDate) return false;
      const recordDay = recordDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return recordDay === day;
    });

    return {
      date: day,
      present: dayRecords.filter(r => r.status === 'approved').length,
      absent: dayRecords.filter(r => r.status === 'rejected').length,
    };
  });

  // Confidence distribution
  const confidenceRanges = [
    { name: '90-100%', value: records.filter(r => r.confidenceScore >= 0.9).length, color: '#10b981' },
    { name: '75-90%', value: records.filter(r => r.confidenceScore >= 0.75 && r.confidenceScore < 0.9).length, color: '#3b82f6' },
    { name: '60-75%', value: records.filter(r => r.confidenceScore >= 0.6 && r.confidenceScore < 0.75).length, color: '#f59e0b' },
    { name: 'Below 60%', value: records.filter(r => r.confidenceScore < 0.6).length, color: '#ef4444' },
  ];

  const handleExport = () => {
    const csvContent = [
      ['Student Name', 'Email', 'Date', 'Time', 'Confidence Score', 'Status'],
      ...records.map(r => {
        const date = getDate(r.timestamp);
        return [
          r.studentName,
          r.studentEmail,
          date ? date.toLocaleDateString() : 'N/A',
          date ? date.toLocaleTimeString() : 'N/A',
          (r.confidenceScore * 100).toFixed(1) + '%',
          r.status,
        ];
      }),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Faculty Dashboard
          </h1>
          <p className="text-gray-600">Monitor attendance and behavioral verification metrics</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-primary-600">{totalStudents}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Attendance</p>
                  <p className="text-3xl font-bold text-green-600">{avgAttendance}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Flagged Records</p>
                  <p className="text-3xl font-bold text-orange-600">{flaggedCount}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                  <p className="text-3xl font-bold text-accent-600">{totalSessions}</p>
                </div>
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-accent-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Attendance Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold mb-4">Attendance Trend (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" name="Present" />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Confidence Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold mb-4">Confidence Score Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={confidenceRanges}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {confidenceRanges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Recent Attendance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card variant="glass" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Recent Attendance</h3>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No attendance records yet</p>
                <p className="text-sm">Records will appear here as students mark attendance</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Confidence</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => {
                      const date = getDate(record.timestamp);
                      return (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{record.studentName}</div>
                              <div className="text-sm text-gray-500">{record.studentEmail}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {date
                              ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
                              : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${record.confidenceScore >= 0.75
                                      ? 'bg-green-500'
                                      : record.confidenceScore >= 0.6
                                        ? 'bg-orange-500'
                                        : 'bg-red-500'
                                    }`}
                                  style={{ width: `${record.confidenceScore * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {(record.confidenceScore * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${record.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : record.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-orange-100 text-orange-800'
                                }`}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};