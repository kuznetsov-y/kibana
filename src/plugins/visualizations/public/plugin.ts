/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import {
  setUISettings,
  setTypes,
  setApplication,
  setCapabilities,
  setHttp,
  setSearch,
  setSavedObjects,
  setUsageCollector,
  setExpressions,
  setUiActions,
  setSavedVisualizationsLoader,
  setTimeFilter,
  setAggs,
  setChrome,
  setOverlays,
  setSavedSearchLoader,
  setEmbeddable,
  setDocLinks,
} from './services';
import {
  VISUALIZE_EMBEDDABLE_TYPE,
  VisualizeEmbeddableFactory,
  createVisEmbeddableFromObject,
} from './embeddable';
import { TypesService } from './vis_types/types_service';
import { range as rangeExpressionFunction } from '../common/expression_functions/range';
import { visDimension as visDimensionExpressionFunction } from '../common/expression_functions/vis_dimension';

import { createStartServicesGetter, StartServicesGetter } from '../../kibana_utils/public';
import { createSavedVisLoader, SavedVisualizationsLoader } from './saved_visualizations';
import type { SerializedVis, Vis } from './vis';
import { showNewVisModal } from './wizard';

import {
  convertFromSerializedVis,
  convertToSerializedVis,
} from './saved_visualizations/_saved_vis';

import { createSavedSearchesLoader } from '../../discover/public';

import type {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  ApplicationStart,
  SavedObjectsClientContract,
  ExecutionContextServiceStart,
} from '../../../core/public';
import type { UsageCollectionSetup } from '../../usage_collection/public';
import type { UiActionsStart } from '../../ui_actions/public';
import type { SavedObjectsStart } from '../../saved_objects/public';
import type { TypesSetup, TypesStart } from './vis_types';
import type {
  Setup as InspectorSetup,
  Start as InspectorStart,
} from '../../../plugins/inspector/public';
import type { DataPublicPluginSetup, DataPublicPluginStart } from '../../../plugins/data/public';
import type { ExpressionsSetup, ExpressionsStart } from '../../expressions/public';
import type { EmbeddableSetup, EmbeddableStart } from '../../embeddable/public';
import { createVisAsync } from './vis_async';

/**
 * Interface for this plugin's returned setup/start contracts.
 *
 * @public
 */

export type VisualizationsSetup = TypesSetup;

export interface VisualizationsStart extends TypesStart {
  savedVisualizationsLoader: SavedVisualizationsLoader;
  createVis: (visType: string, visState: SerializedVis) => Promise<Vis>;
  convertToSerializedVis: typeof convertToSerializedVis;
  convertFromSerializedVis: typeof convertFromSerializedVis;
  showNewVisModal: typeof showNewVisModal;
  __LEGACY: { createVisEmbeddableFromObject: ReturnType<typeof createVisEmbeddableFromObject> };
}

export interface VisualizationsSetupDeps {
  data: DataPublicPluginSetup;
  embeddable: EmbeddableSetup;
  expressions: ExpressionsSetup;
  inspector: InspectorSetup;
  usageCollection: UsageCollectionSetup;
}

export interface VisualizationsStartDeps {
  data: DataPublicPluginStart;
  expressions: ExpressionsStart;
  embeddable: EmbeddableStart;
  inspector: InspectorStart;
  uiActions: UiActionsStart;
  application: ApplicationStart;
  getAttributeService: EmbeddableStart['getAttributeService'];
  savedObjects: SavedObjectsStart;
  savedObjectsClient: SavedObjectsClientContract;
  executionContext: ExecutionContextServiceStart;
}

/**
 * Visualizations Plugin - public
 *
 * This plugin's stateful contracts are returned from the `setup` and `start` methods
 * below. The interfaces for these contracts are provided above.
 *
 * @internal
 */
export class VisualizationsPlugin
  implements
    Plugin<
      VisualizationsSetup,
      VisualizationsStart,
      VisualizationsSetupDeps,
      VisualizationsStartDeps
    > {
  private readonly types: TypesService = new TypesService();
  private getStartServicesOrDie?: StartServicesGetter<VisualizationsStartDeps, VisualizationsStart>;

  constructor(initializerContext: PluginInitializerContext) {}

  public setup(
    core: CoreSetup<VisualizationsStartDeps, VisualizationsStart>,
    { expressions, embeddable, usageCollection, data }: VisualizationsSetupDeps
  ): VisualizationsSetup {
    const start = (this.getStartServicesOrDie = createStartServicesGetter(core.getStartServices));

    setUISettings(core.uiSettings);
    setUsageCollector(usageCollection);

    expressions.registerFunction(rangeExpressionFunction);
    expressions.registerFunction(visDimensionExpressionFunction);
    const embeddableFactory = new VisualizeEmbeddableFactory({ start });
    embeddable.registerEmbeddableFactory(VISUALIZE_EMBEDDABLE_TYPE, embeddableFactory);

    return {
      ...this.types.setup(),
    };
  }

  public start(
    core: CoreStart,
    { data, expressions, uiActions, embeddable, savedObjects }: VisualizationsStartDeps
  ): VisualizationsStart {
    const types = this.types.start();
    setTypes(types);
    setEmbeddable(embeddable);
    setApplication(core.application);
    setCapabilities(core.application.capabilities);
    setHttp(core.http);
    setSavedObjects(core.savedObjects);
    setDocLinks(core.docLinks);
    setSearch(data.search);
    setExpressions(expressions);
    setUiActions(uiActions);
    setTimeFilter(data.query.timefilter.timefilter);
    setAggs(data.search.aggs);
    setOverlays(core.overlays);
    setChrome(core.chrome);
    const savedVisualizationsLoader = createSavedVisLoader({
      savedObjectsClient: core.savedObjects.client,
      indexPatterns: data.indexPatterns,
      savedObjects,
      visualizationTypes: types,
    });
    setSavedVisualizationsLoader(savedVisualizationsLoader);
    const savedSearchLoader = createSavedSearchesLoader({
      savedObjectsClient: core.savedObjects.client,
      savedObjects,
    });
    setSavedSearchLoader(savedSearchLoader);
    return {
      ...types,
      showNewVisModal,
      /**
       * creates new instance of Vis
       * @param {IndexPattern} indexPattern - index pattern to use
       * @param {VisState} visState - visualization configuration
       */
      createVis: async (visType: string, visState: SerializedVis) =>
        await createVisAsync(visType, visState),
      convertToSerializedVis,
      convertFromSerializedVis,
      savedVisualizationsLoader,
      __LEGACY: {
        createVisEmbeddableFromObject: createVisEmbeddableFromObject({
          start: this.getStartServicesOrDie!,
        }),
      },
    };
  }

  public stop() {
    this.types.stop();
  }
}
