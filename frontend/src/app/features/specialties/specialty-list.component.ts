import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialtyService, Specialty } from '../../core/specialty.service';

@Component({
  selector: 'app-specialty-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './specialty-list.component.html',
  styleUrl: './specialty-list.component.css'
})
export class SpecialtyListComponent implements OnInit {
  private readonly specialtyService = inject(SpecialtyService);
  
  readonly specialties = signal<Specialty[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.specialtyService.getAllSpecialties().subscribe({
      next: (data) => {
        this.specialties.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load specialties. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }
}