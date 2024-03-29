import { Injectable, inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Recipe } from './recipe.model';
import { DataStorageService } from '../shared/data-storage.service';
import { RecipeService } from './recipe.service';
import { RecipeSortService } from './recipe-sort.service';

@Injectable({ providedIn: 'root' })
export class RecipesResolverService {
    constructor(
      private dataStorageService: DataStorageService, 
      private recipeService: RecipeService,
      private recipeSortService: RecipeSortService) { 
        this.recipeSortService.recipesChanged.subscribe((recipes: Recipe[]) => { // subscribe to the recipesChanged Subject
          this.recipeService.setRecipes(recipes);
        });
      }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      const recipes = this.recipeService.getRecipes();

      if (recipes.length === 0) {
        this.dataStorageService.fetchRecipes().forEach(recipes => {
          console.log('recipes: ' + JSON.stringify(recipes));
        });

        return this.dataStorageService.fetchRecipes();
      } else {
        return recipes;
      }
    }
}