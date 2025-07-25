/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as React from 'react';
import {useCallback, useContext} from 'react';
import {copy} from 'clipboard-js';
import {toNormalUrl} from 'jsc-safe-url';

import Button from '../Button';
import ButtonIcon from '../ButtonIcon';
import Skeleton from './Skeleton';
import {withPermissionsCheck} from 'react-devtools-shared/src/frontend/utils/withPermissionsCheck';

import ViewElementSourceContext from './ViewElementSourceContext';

import type {ReactFunctionLocation} from 'shared/ReactTypes';
import styles from './InspectedElementSourcePanel.css';

type Props = {
  source: ReactFunctionLocation,
  symbolicatedSourcePromise: Promise<ReactFunctionLocation | null>,
};

function InspectedElementSourcePanel({
  source,
  symbolicatedSourcePromise,
}: Props): React.Node {
  return (
    <div>
      <div className={styles.SourceHeaderRow}>
        <div className={styles.SourceHeader}>source</div>

        <React.Suspense fallback={<Skeleton height={16} width={16} />}>
          <CopySourceButton
            source={source}
            symbolicatedSourcePromise={symbolicatedSourcePromise}
          />
        </React.Suspense>
      </div>

      <React.Suspense
        fallback={
          <div className={styles.SourceOneLiner}>
            <Skeleton height={16} width="40%" />
          </div>
        }>
        <FormattedSourceString
          source={source}
          symbolicatedSourcePromise={symbolicatedSourcePromise}
        />
      </React.Suspense>
    </div>
  );
}

function CopySourceButton({source, symbolicatedSourcePromise}: Props) {
  const symbolicatedSource = React.use(symbolicatedSourcePromise);
  if (symbolicatedSource == null) {
    const [, sourceURL, line, column] = source;
    const handleCopy = withPermissionsCheck(
      {permissions: ['clipboardWrite']},
      () => copy(`${sourceURL}:${line}:${column}`),
    );

    return (
      <Button onClick={handleCopy} title="Copy to clipboard">
        <ButtonIcon type="copy" />
      </Button>
    );
  }

  const [, sourceURL, line, column] = symbolicatedSource;
  const handleCopy = withPermissionsCheck(
    {permissions: ['clipboardWrite']},
    () => copy(`${sourceURL}:${line}:${column}`),
  );

  return (
    <Button onClick={handleCopy} title="Copy to clipboard">
      <ButtonIcon type="copy" />
    </Button>
  );
}

function FormattedSourceString({source, symbolicatedSourcePromise}: Props) {
  const symbolicatedSource = React.use(symbolicatedSourcePromise);

  const {canViewElementSourceFunction, viewElementSourceFunction} = useContext(
    ViewElementSourceContext,
  );

  // In some cases (e.g. FB internal usage) the standalone shell might not be able to view the source.
  // To detect this case, we defer to an injected helper function (if present).
  const linkIsEnabled =
    viewElementSourceFunction != null &&
    source != null &&
    (canViewElementSourceFunction == null ||
      canViewElementSourceFunction(source, symbolicatedSource));

  const viewSource = useCallback(() => {
    if (viewElementSourceFunction != null && source != null) {
      viewElementSourceFunction(source, symbolicatedSource);
    }
  }, [source, symbolicatedSource]);

  const [, sourceURL, line] =
    symbolicatedSource == null ? source : symbolicatedSource;

  return (
    <div
      className={styles.SourceOneLiner}
      data-testname="InspectedElementView-FormattedSourceString">
      {linkIsEnabled ? (
        <span className={styles.Link} onClick={viewSource}>
          {formatSourceForDisplay(sourceURL, line)}
        </span>
      ) : (
        formatSourceForDisplay(sourceURL, line)
      )}
    </div>
  );
}

// This function is based on describeComponentFrame() in packages/shared/ReactComponentStackFrame
function formatSourceForDisplay(sourceURL: string, line: number) {
  // Metro can return JSC-safe URLs, which have `//&` as a delimiter
  // https://www.npmjs.com/package/jsc-safe-url
  const sanitizedSourceURL = sourceURL.includes('//&')
    ? toNormalUrl(sourceURL)
    : sourceURL;

  // Note: this RegExp doesn't work well with URLs from Metro,
  // which provides bundle URL with query parameters prefixed with /&
  const BEFORE_SLASH_RE = /^(.*)[\\\/]/;

  let nameOnly = sanitizedSourceURL.replace(BEFORE_SLASH_RE, '');

  // In DEV, include code for a common special case:
  // prefer "folder/index.js" instead of just "index.js".
  if (/^index\./.test(nameOnly)) {
    const match = sanitizedSourceURL.match(BEFORE_SLASH_RE);
    if (match) {
      const pathBeforeSlash = match[1];
      if (pathBeforeSlash) {
        const folderName = pathBeforeSlash.replace(BEFORE_SLASH_RE, '');
        nameOnly = folderName + '/' + nameOnly;
      }
    }
  }

  return `${nameOnly}:${line}`;
}

export default InspectedElementSourcePanel;
