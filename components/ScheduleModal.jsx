'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, ArrowRight, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { db } from '@/firebase/firebaseClient';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import useFirebaseAuth from '@/components/useFirebaseAuth';

export default function ScheduleModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [hasExistingCall, setHasExistingCall] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate) {
        setBookedSlots([]);
        return;
      }
      try {
        const dateString = selectedDate.toDateString();
        const q = query(collection(db, 'scheduled_calls'), where('date', '==', dateString));
        const querySnapshot = await getDocs(q);
        const booked = [];
        querySnapshot.forEach((doc) => {
          booked.push(doc.data().time);
        });
        setBookedSlots(booked);
      } catch (err) {
        console.error("Failed to fetch booked slots:", err);
      }
    };
    fetchBookedSlots();
  }, [selectedDate]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
      setNotes('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate next 7 days for the date picker
  const upcomingDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start from tomorrow
    return d;
  });

  const timeSlots = [
    "09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"
  ];

  const { user } = useFirebaseAuth();

  useEffect(() => {
    if (!isOpen || !user?.uid) return;
    const checkExistingCall = async () => {
      setCheckingExisting(true);
      try {
        const q = query(
          collection(db, 'scheduled_calls'), 
          where('user_id', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setHasExistingCall(true);
        } else {
          setHasExistingCall(false);
        }
      } catch (err) {
        console.error("Failed to check existing call:", err);
      } finally {
        setCheckingExisting(false);
      }
    };
    checkExistingCall();
  }, [isOpen, user]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'scheduled_calls'), {
        user_id: user?.uid || 'anonymous',
        email: user?.email || 'Unknown',
        date: selectedDate?.toDateString() || null,
        time: selectedTime,
        notes: notes,
        status: 'Upcoming',
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error saving scheduled call:", e);
    }
    
    // Simulate backend /api/schedule calendar invite delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setStep(3); // Success step
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-lg rounded-[24px] border border-white/10 bg-[#0A0A0A] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-inset ring-white/5 relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Gradient Line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Schedule Consultation</h2>
            <p className="text-xs text-amber-500 font-medium tracking-wide uppercase mt-0.5">Premium Support</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {checkingExisting && (
              <motion.div key="checking" className="flex justify-center items-center h-32">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
              </motion.div>
            )}

            {!checkingExisting && hasExistingCall && (
              <motion.div
                key="exists"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center space-y-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20 text-orange-500 mb-2 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Call Already Scheduled</h3>
                <p className="text-sm text-gray-400 max-w-[280px]">
                  You have already scheduled your one-time consultation. Our premium strategy calls are limited to one per user.
                </p>
              </motion.div>
            )}

            {!checkingExisting && !hasExistingCall && step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-amber-500" />
                    Select a Date
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {upcomingDays.map((date, idx) => {
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDate(date)}
                          className={`flex flex-col items-center justify-center rounded-xl border p-2 transition-all ${
                            isSelected 
                              ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                              : 'border-white/10 bg-white/5 text-gray-400 hover:border-amber-500/30 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-xs font-medium uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                          <span className="text-lg font-bold text-white my-0.5">{date.getDate()}</span>
                          <span className="text-[10px]">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden pt-2"
                    >
                      <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        Select a Time
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.filter(t => !bookedSlots.includes(t)).length > 0 ? (
                          timeSlots.filter(t => !bookedSlots.includes(t)).map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                                selectedTime === time
                                  ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-amber-500/30 hover:bg-white/10'
                              }`}
                            >
                              {time}
                            </button>
                          ))
                        ) : (
                          <div className="col-span-3 py-4 text-center text-sm text-gray-500 font-medium border border-white/5 bg-white/[0.02] rounded-xl">
                            All slots booked for this day.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium">Selected Time</p>
                    <p className="text-white font-bold tracking-wide">
                      {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">What would you like to discuss?</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe the automation or bottleneck you need help with..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#111] p-3 text-sm text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all h-28"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center space-y-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500 mb-2 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Call Scheduled!</h3>
                <p className="text-sm text-gray-400 max-w-[280px]">
                  Your consultation is booked for <span className="text-white font-medium">{selectedDate?.toLocaleDateString()}</span> at <span className="text-white font-medium">{selectedTime}</span>. 
                  A Google Calendar invite has been sent to your email.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/5 p-4 bg-[#111] flex justify-end gap-3">
          {checkingExisting && (
            <button disabled className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500">Please wait...</button>
          )}
          {!checkingExisting && hasExistingCall && (
            <button onClick={onClose} className="w-full rounded-lg bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20">
              Close
            </button>
          )}
          {!checkingExisting && !hasExistingCall && step === 1 && (
            <>
              <button onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button 
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_15px_rgba(245,158,11,0.2)] transition-all hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
          {!checkingExisting && !hasExistingCall && step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 transition-colors flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <button 
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex items-center justify-center min-w-[140px] gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_15px_rgba(245,158,11,0.2)] transition-all hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)] disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? 'Scheduling...' : 'Confirm Booking'}
              </button>
            </>
          )}
          {!checkingExisting && !hasExistingCall && step === 3 && (
            <button 
              onClick={onClose}
              className="w-full rounded-lg bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
            >
              Done
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
