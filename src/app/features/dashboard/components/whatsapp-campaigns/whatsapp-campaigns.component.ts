import { Component } from '@angular/core';
import { Notification } from '../../../../shared/models/notification.model';

@Component({
  selector: 'app-whatsapp-campaigns',
  standalone: false,
  templateUrl: './whatsapp-campaigns.component.html',
  styleUrl: './whatsapp-campaigns.component.css'
})
export class WhatsappCampaignsComponent {
  historyData: Notification[] = [
    { date: "2025-09-20", type: "WhatsApp", audience: "Inactive", message: "Hi 👋 we noticed you haven't ordered Amoxicillin...", status: "Sent" },
    { date: "2025-09-10", type: "Email", audience: "All", message: "🎉 Special offer this week...", status: "Sent" },
    { date: "2025-08-30", type: "SMS", audience: "Pending Payments", message: "Your payment is overdue...", status: "Failed" }
  ];

  filteredHistory: Notification[] = [];

  message: string = '';
  searchValue: string = '';

  constructor() {}

  ngOnInit() {
    this.filteredHistory = [...this.historyData];
  }

  filterHistory() {
    const val = this.searchValue.toLowerCase();
    this.filteredHistory = this.historyData.filter(n => 
      n.message.toLowerCase().includes(val) || n.audience.toLowerCase().includes(val)
    );
  }

  aiSuggest() {
    this.message = "🤖 AI Suggestion: Hi 👋, we noticed a product gap in your last order. Would you like us to restock Amoxicillin for you?";
  }

  sendNow() {
    alert("✅ Notification sent! (In real project, connect this button to your .NET Core API)");
  }
}
