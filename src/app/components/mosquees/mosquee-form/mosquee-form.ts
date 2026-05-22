import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MosqueeService, MosqueeRequest, Mosquee } from '../../../services/mosquee';
import { FileUploadService } from '../../../services/file-upload';
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
  private fileUploadService = inject(FileUploadService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mosqueeForm!: FormGroup;
  isEditMode = false;
  mosqueeId: string | null = null;
  isLoading = false;

  // Upload image de couverture de la mosquée
  selectedCoverFile: File | null = null;
  coverPreviewUrl: string | null = null;
  existingCoverUrl: string | null = null;

  // Upload photo de l'Imam
  selectedImamFile: File | null = null;
  imamPreviewUrl: string | null = null;
  existingImamUrl: string | null = null;

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
      latitude: [12.6392, Validators.required],
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
        bio: ['']
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
    this.mosqueeForm.patchValue({ latitude: lat, longitude: lng });
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
          imam: { nom: mosquee.imam?.nom, bio: mosquee.imam?.bio }
        });

        if (mosquee.imam?.photoUrl) {
          this.existingImamUrl = mosquee.imam.photoUrl;
          this.imamPreviewUrl = this.mosqueeService.getImamPhotoUrl(mosquee.imam.photoUrl);
        }

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

  // --- Image de couverture de la mosquée ---
  onCoverSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedCoverFile = file;
    const reader = new FileReader();
    reader.onload = () => this.coverPreviewUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  removeCover(): void {
    this.selectedCoverFile = null;
    this.coverPreviewUrl = null;
    this.existingCoverUrl = null;
  }

  // --- Photo de l'Imam ---
  onImamPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedImamFile = file;
    const reader = new FileReader();
    reader.onload = () => this.imamPreviewUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  removeImamPhoto(): void {
    this.selectedImamFile = null;
    this.imamPreviewUrl = null;
    this.existingImamUrl = null;
  }

  // --- Soumission ---
  onSubmit(): void {
    if (this.mosqueeForm.invalid) return;
    this.isLoading = true;

    const payload: MosqueeRequest = this.mosqueeForm.value as MosqueeRequest;

    const action = this.isEditMode
      ? this.mosqueeService.update(this.mosqueeId!, payload)
      : this.mosqueeService.createMosquee(
          payload,
          this.selectedImamFile ?? undefined
        );

    action.subscribe({
      next: (savedMosquee: Mosquee) => {
        const uploads: Promise<void>[] = [];

        if (this.selectedCoverFile && savedMosquee.id) {
          uploads.push(
            new Promise<void>((resolve) => {
              this.fileUploadService
                .uploadMosqueeImage(savedMosquee.id!, this.selectedCoverFile!, true)
                .subscribe({ next: () => resolve(), error: () => resolve() });
            })
          );
        }

        // En édition uniquement : photo imam via POST /mosquees/{id}/images
        if (this.isEditMode && this.selectedImamFile && savedMosquee.id) {
          uploads.push(
            new Promise<void>((resolve) => {
              this.fileUploadService
                .uploadMosqueeImage(savedMosquee.id!, this.selectedImamFile!, false)
                .subscribe({ next: () => resolve(), error: () => resolve() });
            })
          );
        }

        Promise.all(uploads).then(() => {
          this.router.navigate(['/dashboard/mosquees']);
        });
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        alert('Une erreur est survenue lors de l\'enregistrement.');
      }
    });
  }
}
