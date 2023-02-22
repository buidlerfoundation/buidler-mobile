import ErrorBoundary from 'components/ErrorBoundary';
import React, {memo, useEffect, useState} from 'react';
import {UriProps, SvgXml} from 'react-native-svg';

const SvgUri = (props: UriProps) => {
  const [xml, setXml] = useState<null | string>(null);

  useEffect(
    function fetchXml() {
      // eslint-disable-next-line no-undef
      const fetchController = new AbortController();

      if (props.uri !== null)
        fetch(props.uri, {signal: fetchController.signal})
          .then(response => response.text())
          .then(setXml)
          .catch(err => console.log(err));

      return () => fetchController.abort();
    },
    [props.uri],
  );
  return (
    <ErrorBoundary>
      <SvgXml xml={xml} override={props} />
    </ErrorBoundary>
  );
};

export default memo(SvgUri);
