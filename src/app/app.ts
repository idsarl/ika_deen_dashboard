import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Composant racine de l'application.
 * Il sert de conteneur principal pour toutes les autres vues via le RouterOutlet.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Titre de l'application géré avec un signal pour la réactivité
  protected readonly title = signal('ika-deen-dashboard');
}
