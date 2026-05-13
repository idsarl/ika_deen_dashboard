import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MosqueeService, MosqueeRequest } from '../../../services/mosquee';
import * as L from 'leaflet';

@Component({
  selector: 'app-mosquee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mosquee-form.html',
  styleUrls: ['./mosquee-form.css']
})
export class MosqueeFormComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private mosqueeService = inject(MosqueeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mosqueeForm!: FormGroup;
  isEditMode = false;
  mosqueeId: string | null = null;
  isLoading = false;
  
  private map!: L.Map;
  private marker!: L.Marker;

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.mosqueeId = this.route.snapshot.paramMap.get('id');
    if (this.mosqueeId) {
      this.isEditMode = true;
      this.loadMosqueeData(this.mosqueeId);
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initForm(): void {
    this.mosqueeForm = this.fb.group({
      nom: this.fb.group({
        fr: ['', Validators.required],
        ar: ['']
      }),
      description: this.fb.group({
        fr: [''],
        ar: ['']
      }),
      latitude: [12.6392, Validators.required], // Défaut: Bamako
      longitude: [-8.0029, Validators.required],
      adresse: this.fb.group({
        rue: [''],
        ville: ['', Validators.required],
        pays: ['Mali', Validators.required]
      }),
      contact: this.fb.group({
        telephone: [''],
        email: [''],
        siteWeb: ['']
      }),
      equipements: this.fb.group({
        parking: [false],
        sectionFemmes: [false],
        accesHandicapes: [false]
      }),
      horairesPriere: this.fb.group({
        fajr: [''],
        dhuhr: [''],
        asr: [''],
        maghrib: [''],
        isha: [''],
        jumua: ['']
      }),
      imam: this.fb.group({
        nom: [''],
        bio: [''],
        photoUrl: ['']
      })
    });
  }

  private initMap(): void {
    const lat = this.mosqueeForm.get('latitude')?.value || 12.6392;
    const lng = this.mosqueeForm.get('longitude')?.value || -8.0029;

    this.map = L.map('map').setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);

    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();
      this.updateCoords(position.lat, position.lng);
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.marker.setLatLng([lat, lng]);
      this.updateCoords(lat, lng);
    });
  }

  private updateCoords(lat: number, lng: number): void {
    this.mosqueeForm.patchValue({
      latitude: lat,
      longitude: lng
    });
  }

  private loadMosqueeData(id: string): void {
    this.isLoading = true;
    this.mosqueeService.getById(id).subscribe({
      next: (mosquee) => {
        this.mosqueeForm.patchValue({
          nom: mosquee.nom,
          description: mosquee.description,
          latitude: mosquee.location.coordinates[1],
          longitude: mosquee.location.coordinates[0],
          adresse: mosquee.adresse,
          contact: mosquee.contact,
          equipements: mosquee.equipements,
          horairesPriere: mosquee.horairesPriere,
          imam: mosquee.imam
        });

        const newPos = L.latLng(mosquee.location.coordinates[1], mosquee.location.coordinates[0]);
        this.marker.setLatLng(newPos);
        this.map.setView(newPos, 15);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.mosqueeForm.invalid) return;

    this.isLoading = true;
    const request: MosqueeRequest = this.mosqueeForm.value;

    const action = this.isEditMode 
      ? this.mosqueeService.update(this.mosqueeId!, request)
      : this.mosqueeService.create(request);

    action.subscribe({
      next: () => {
        this.router.navigate(['/dashboard/mosquees']);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        alert('Une erreur est survenue lors de l\'enregistrement.');
      }
    });
  }
}
