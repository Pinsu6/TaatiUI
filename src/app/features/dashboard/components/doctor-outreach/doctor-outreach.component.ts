import { Component } from '@angular/core';
import { Doctor } from '../../../../shared/models/doctor.model';

@Component({
  selector: 'app-doctor-outreach',
  standalone: false,
  templateUrl: './doctor-outreach.component.html',
  styleUrl: './doctor-outreach.component.css'
})
export class DoctorOutreachComponent {
  doctors: Doctor[] = [
    {
      name: "Dr. Ramesh Patel",
      specialization: "General Physician",
      contact: "+91 9876543210",
      totalOrders: 45,
      lastOrder: "2025-09-15",
      ordered: "Paracetamol, Amoxicillin",
      notOrdered: "Vitamin D3, Cough Syrup",
      ai: "Recommend promoting Vitamin D3 to Dr. Ramesh — 3-month gap in prescribing supplements."
    },
    {
      name: "Dr. Sneha Verma",
      specialization: "Pediatrician",
      contact: "+91 9090909090",
      totalOrders: 28,
      lastOrder: "2025-08-30",
      ordered: "Azithromycin, Vitamin C",
      notOrdered: "Ibuprofen",
      ai: "Ibuprofen usage trending up among peers — suggest outreach for pediatric pain relief line."
    },
    {
      name: "Dr. Amit Shah",
      specialization: "Cardiologist",
      contact: "+91 9123456780",
      totalOrders: 12,
      lastOrder: "2025-07-10",
      ordered: "Atorvastatin",
      notOrdered: "Amoxicillin, Vitamin C",
      ai: "Dr. Amit hasn’t ordered antibiotics in 4 months — consider targeted WhatsApp campaign."
    },
    // Added more real-world data for demonstration (expandable)
    {
      name: "Dr. Fatima Conteh",
      specialization: "General Physician",
      contact: "+232 76 123456",
      totalOrders: 35,
      lastOrder: "2025-09-20",
      ordered: "Amoxicillin, Paracetamol",
      notOrdered: "Antimalarials, Vitamins",
      ai: "Suggest antimalarial stock-up for seasonal demand in Freetown region."
    },
    {
      name: "Dr. Samuel Kamara",
      specialization: "Pediatrician",
      contact: "+232 88 987654",
      totalOrders: 22,
      lastOrder: "2025-08-25",
      ordered: "Vitamin C, Ibuprofen",
      notOrdered: "Vaccines, Cough Syrup",
      ai: "Highlight new vaccine arrivals to address child health trends in Bo."
    }
  ];

  filteredDoctors: Doctor[] = [];

  searchQuery: string = '';
  selectedSpecialization: string = 'all';

  // Enhanced: Sorting state
  sortColumn: keyof Doctor = 'totalOrders';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor() {}

  ngOnInit() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.doctors.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            d.specialization.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesSpec = this.selectedSpecialization === 'all' || 
                          d.specialization.toLowerCase().includes(this.selectedSpecialization.toLowerCase());
      return matchesSearch && matchesSpec;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredDoctors = filtered;
  }

  sortBy(column: keyof Doctor) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }
    this.applyFilters();
  }

  // Action handlers (real-world: integrate with services/modals)
  sendWhatsApp(doctor: Doctor) {
    alert(`Sending WhatsApp to ${doctor.name}: ${doctor.contact} (Placeholder for integration)`);
    // Future: Open modal or call service
  }

  viewDetails(doctor: Doctor) {
    alert(`Viewing details for ${doctor.name} (Placeholder: Navigate to /doctors/${doctor.name} or modal)`);
    // Future: Router navigate or modal
  }

  sendCampaign(doctor: Doctor) {
    alert(`Sending campaign to ${doctor.name} based on AI: ${doctor.ai} (Placeholder for API)`);
    // Future: Call NotificationService
  }
}
