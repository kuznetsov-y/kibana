/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import React from 'react';
import { ShareContext } from 'src/plugins/share/public';
import { ExportPanelShareOpts, JobParamsProviderOptions, ReportingSharingData } from '.';
import { checkLicense } from '../lib/license_check';
import { ReportingAPIClient } from '../lib/reporting_api_client';
import { ScreenCapturePanelContent } from './screen_capture_panel_content_lazy';

const getJobParams = (
  apiClient: ReportingAPIClient,
  opts: JobParamsProviderOptions,
  type: 'pdf' | 'png'
) => () => {
  const {
    objectType,
    sharingData: { title, layout },
  } = opts;

  const baseParams = {
    objectType,
    layout,
    title,
  };

  // Relative URL must have URL prefix (Spaces ID prefix), but not server basePath
  // Replace hashes with original RISON values.
  const relativeUrl = opts.shareableUrl.replace(
    window.location.origin + apiClient.getServerBasePath(),
    ''
  );

  if (type === 'pdf') {
    // multi URL for PDF
    return { ...baseParams, relativeUrls: [relativeUrl] };
  }

  // single URL for PNG
  return { ...baseParams, relativeUrl };
};

export const reportingScreenshotShareProvider = ({
  apiClient,
  toasts,
  uiSettings,
  license$,
  startServices$,
  usesUiCapabilities,
}: ExportPanelShareOpts) => {
  let licenseToolTipContent = '';
  let licenseDisabled = true;
  let licenseHasScreenshotReporting = false;
  let capabilityHasDashboardScreenshotReporting = false;
  let capabilityHasVisualizeScreenshotReporting = false;

  license$.subscribe((license) => {
    const { enableLinks, showLinks, message } = checkLicense(license.check('reporting', 'gold'));
    licenseToolTipContent = message;
    licenseHasScreenshotReporting = showLinks;
    licenseDisabled = !enableLinks;
  });

  if (usesUiCapabilities) {
    startServices$.subscribe(([{ application }]) => {
      // TODO: add abstractions in ExportTypeRegistry to use here?
      capabilityHasDashboardScreenshotReporting =
        application.capabilities.dashboard?.generateScreenshot === true;
      capabilityHasVisualizeScreenshotReporting =
        application.capabilities.visualize?.generateScreenshot === true;
    });
  } else {
    // deprecated
    capabilityHasDashboardScreenshotReporting = true;
    capabilityHasVisualizeScreenshotReporting = true;
  }

  const getShareMenuItems = ({
    objectType,
    objectId,
    isDirty,
    onClose,
    shareableUrl,
    ...shareOpts
  }: ShareContext) => {
    if (!licenseHasScreenshotReporting) {
      return [];
    }

    if (!['dashboard', 'visualization'].includes(objectType)) {
      return [];
    }

    if (objectType === 'dashboard' && !capabilityHasDashboardScreenshotReporting) {
      return [];
    }

    if (objectType === 'visualize' && !capabilityHasVisualizeScreenshotReporting) {
      return [];
    }

    const { sharingData } = (shareOpts as unknown) as { sharingData: ReportingSharingData };
    const shareActions = [];

    const pngPanelTitle = i18n.translate('xpack.reporting.shareContextMenu.pngReportsButtonLabel', {
      defaultMessage: 'PNG Reports',
    });

    const panelPng = {
      shareMenuItem: {
        name: pngPanelTitle,
        icon: 'document',
        toolTipContent: licenseToolTipContent,
        disabled: licenseDisabled,
        ['data-test-subj']: 'pngReportMenuItem',
        sortOrder: 10,
      },
      panel: {
        id: 'reportingPngPanel',
        title: pngPanelTitle,
        content: (
          <ScreenCapturePanelContent
            apiClient={apiClient}
            toasts={toasts}
            uiSettings={uiSettings}
            reportType="png"
            objectId={objectId}
            requiresSavedState={true}
            getJobParams={getJobParams(apiClient, { shareableUrl, objectType, sharingData }, 'png')}
            isDirty={isDirty}
            onClose={onClose}
          />
        ),
      },
    };

    const pdfPanelTitle = i18n.translate('xpack.reporting.shareContextMenu.pdfReportsButtonLabel', {
      defaultMessage: 'PDF Reports',
    });

    const panelPdf = {
      shareMenuItem: {
        name: pdfPanelTitle,
        icon: 'document',
        toolTipContent: licenseToolTipContent,
        disabled: licenseDisabled,
        ['data-test-subj']: 'pdfReportMenuItem',
        sortOrder: 10,
      },
      panel: {
        id: 'reportingPdfPanel',
        title: pdfPanelTitle,
        content: (
          <ScreenCapturePanelContent
            apiClient={apiClient}
            toasts={toasts}
            uiSettings={uiSettings}
            reportType="printablePdf"
            objectId={objectId}
            requiresSavedState={true}
            layoutOption={objectType === 'dashboard' ? 'print' : undefined}
            getJobParams={getJobParams(apiClient, { shareableUrl, objectType, sharingData }, 'pdf')}
            isDirty={isDirty}
            onClose={onClose}
          />
        ),
      },
    };

    shareActions.push(panelPng);
    shareActions.push(panelPdf);
    return shareActions;
  };

  return { id: 'screenCaptureReports', getShareMenuItems };
};
