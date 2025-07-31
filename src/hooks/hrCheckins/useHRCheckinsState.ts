
import { useState } from "react";
import { hrCheckinService } from "./hrCheckinService";
import { MemberBAUSummary, DepartmentBAUSummary, CheckinFollowupTask } from "@/types/hrCheckin";

export function useHRCheckinsState() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [memberBAUSummary, setMemberBAUSummary] = useState<MemberBAUSummary | null>(null);
  const [departmentBAUSummary, setDepartmentBAUSummary] = useState<DepartmentBAUSummary | null>(null);
  const [pendingTasks, setPendingTasks] = useState<CheckinFollowupTask[]>([]);

  // Load member data
  const loadMemberData = async (memberId: string) => {
    try {
      const [bauSummary, tasks] = await Promise.all([
        hrCheckinService.getMemberBAUSummary(memberId),
        hrCheckinService.getPendingTasksForMember(memberId)
      ]);
      setMemberBAUSummary(bauSummary);
      setPendingTasks(tasks);
    } catch (error) {
      console.error('Error loading member data:', error);
      setMemberBAUSummary(null);
      setPendingTasks([]);
    }
  };

  // Load department data (including pending tasks for department-wide check-ins)
  const loadDepartmentData = async (departmentName: string) => {
    try {
      const [deptSummary, deptTasks] = await Promise.all([
        hrCheckinService.getDepartmentBAUSummary(departmentName),
        hrCheckinService.getPendingTasksForDepartment(departmentName)
      ]);
      setDepartmentBAUSummary(deptSummary);
      setPendingTasks(deptTasks);
    } catch (error) {
      console.error('Error loading department data:', error);
      setDepartmentBAUSummary(null);
      setPendingTasks([]);
    }
  };

  // Handle department change
  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    setSelectedMember(""); // Reset member selection
    setMemberBAUSummary(null);
    setPendingTasks([]);
    
    if (department) {
      loadDepartmentData(department);
    } else {
      setDepartmentBAUSummary(null);
    }
  };

  // Handle member change
  const handleMemberChange = (memberId: string) => {
    setSelectedMember(memberId);
    if (memberId) {
      loadMemberData(memberId);
    } else {
      setMemberBAUSummary(null);
      setPendingTasks([]);
    }
  };

  return {
    selectedDepartment,
    selectedMember,
    memberBAUSummary,
    departmentBAUSummary,
    pendingTasks,
    handleDepartmentChange,
    handleMemberChange,
    loadMemberData,
    loadDepartmentData
  };
}
