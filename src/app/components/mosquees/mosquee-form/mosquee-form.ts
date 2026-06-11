import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MosqueeService, MosqueeRequest, Mosquee } from '../../../services/mosquee';
import { FileUploadService } from '../../../services/file-upload';
import * as L from 'leaflet';
import { Utilisateur, UtilisateurService } from '../../../services/UtilisateurService';
import { Observable, forkJoin } from 'rxjs';

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
  private utilisateurService = inject(UtilisateurService);

  mosqueeForm!: FormGroup;
  isEditMode = false;
  mosqueeId: string | null = null;
  isLoading = false;
  admins: Utilisateur[] = [];

  // Images
  selectedCoverFile: File | null = null;
  coverPreviewUrl: string | null = null;
  existingCoverUrl: string | null = null;

  selectedImamFile: File | null = null;
  imamPreviewUrl: string | null = null;
  existingImamUrl: string | null = null;

  private map!: L.Map;
  private marker!: L.Marker;

  constructor() {
    this.initForm();
  }

  // --- Sécurité ---
  isSuperAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const ikaUser = JSON.parse(localStorage.getItem('ika_user') || '{}');
    return user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN' || ikaUser?.role === 'ROLE_SUPER_ADMIN' || ikaUser?.role === 'SUPER_ADMIN';
  }

  private applyPermissions(): void {
    if (this.isEditMode && !this.isSuperAdmin()) {
      this.mosqueeForm.get('admin')?.disable();
    }
  }

  ngOnInit(): void {
    this.mosqueeId = this.route.snapshot.paramMap.get('id');
    this.loadAdmins();
    if (this.mosqueeId) {
      this.isEditMode = true;
      this.loadMosqueeData(this.mosqueeId);
    }
  }

  loadAdmins(): void {
    this.utilisateurService.getAdmins().subscribe(data => {
      this.admins = data;
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initForm(): void {
    this.mosqueeForm = this.fb.group({
      nom: this.fb.group({ fr: ['', Validators.required], ar: [''] }),
      description: this.fb.group({ fr: [''], ar: [''] }),
      latitude: [12.6392, Validators.required],
      longitude: [-8.0029, Validators.required],
      adresse: this.fb.group({ rue: [''], ville: ['', Validators.required], pays: ['Mali', Validators.required] }),
      contact: this.fb.group({ telephone: [''], email: [''], siteWeb: [''] }),
      equipements: this.fb.group({ parking: [false], sectionFemmes: [false], accesHandicapes: [false] }),
      horairesPriere: this.fb.group({ fajr: [''], dhuhr: [''], asr: [''], maghrib: [''], isha: [''], jumua: [''] }),
      imam: this.fb.group({ nom: [''], bio: [''] }),
      admin: this.fb.group({ email: [''], motDePasse: [''], telephone: [''] })
    });
  }

  private initMap(): void {
    const lat = this.mosqueeForm.get('latitude')?.value || 12.6392;
    const lng = this.mosqueeForm.get('longitude')?.value || -8.0029;
    this.map = L.map('map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(this.map);
    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
    this.marker.on('dragend', () => this.updateCoords(this.marker.getLatLng().lat, this.marker.getLatLng().lng));
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.marker.setLatLng(e.latlng);
      this.updateCoords(e.latlng.lat, e.latlng.lng);
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
          imam: { nom: mosquee.imam?.nom, bio: mosquee.imam?.bio },
          admin: { email: mosquee.adminManager?.email }
        });
        
        if (mosquee.imam?.photoUrl) {
          this.existingImamUrl = mosquee.imam.photoUrl;
          this.imamPreviewUrl = this.mosqueeService.getImamPhotoUrl(mosquee.imam.photoUrl);
        }
        
        this.applyPermissions(); // Verrouillage après chargement
        const newPos = L.latLng(mosquee.location.coordinates[1], mosquee.location.coordinates[0]);
        this.marker.setLatLng(newPos);
        this.map.setView(newPos, 15);
        this.isLoading = false;
      }
    });
  }

  // --- Gestion images ---
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

    // Récupération de toutes les données (incluant celles désactivées)
    const payload = this.mosqueeForm.getRawValue();

    // Suppression sécurisée si non autorisé
    if (!this.isSuperAdmin()) {
      delete payload.admin;
    }

    const action = this.isEditMode
      ? this.mosqueeService.update(this.mosqueeId!, payload)
      : this.mosqueeService.createMosquee(payload, this.selectedImamFile ?? undefined);

    action.subscribe({
      next: (savedMosquee) => this.handleUploadsAndRedirect(savedMosquee.id!),
      error: (err) => this.handleError(err)
    });
  }

  private handleUploadsAndRedirect(mosqueeId: string): void {
    const uploads: Observable<any>[] = [];
    if (this.selectedCoverFile) {
      uploads.push(this.fileUploadService.uploadMosqueeImage(mosqueeId, this.selectedCoverFile, true));
    }
    if (uploads.length > 0) {
      forkJoin(uploads).subscribe(() => this.router.navigate(['/dashboard/mosquees']));
    } else {
      this.router.navigate(['/dashboard/mosquees']);
    }
  }

  private handleError(err: any): void {
    console.error(err);
    this.isLoading = false;
    alert('Erreur lors de l\'enregistrement : ' + (err.error?.message || 'Vérifiez les données'));
  }
}