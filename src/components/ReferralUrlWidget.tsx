"use client";

import React from 'react';

interface ViralLoopsFormWidgetInput {
    ucid: string;
}

function ReferralUrlWidget({ ucid }: ViralLoopsFormWidgetInput) {
    if (!ucid) return null;

    return React.createElement('sharing-options-widget', { ucid });
}

export default ReferralUrlWidget;