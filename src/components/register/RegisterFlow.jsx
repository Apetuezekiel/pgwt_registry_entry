import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import flierSrc from '../../data/imgg/pgwt2026_flier.webp';
import markSrc from '../../data/imgg/pgwt_mark.png';
import InviteStage from './InviteStage';
import PhotoEditor from './PhotoEditor';
import { EVENT } from './eventInfo';
import { ZOOM_MIN, ZOOM_MAX, clampOffsets, initialTransform, panLimits, renderInviteBlob } from './drawInvite';
import { saveInvite, clearInvite } from './inviteStore';
import { submitRegistration } from './submitRegistration';
import './register.css';

const DRAFT_KEY = 'pgwt-reg-draft-2026';
const EMPTY = { to_firstname: '', to_lastname: '', to_phone: '', to_email: '', to_address: '' };
const STEPS = ['Details', 'Photo', 'Review'];
const IDENTITY = { zoom: 1, rotation: 0, ox: 0, oy: 0 };
const PAN_STEP = 0.06;
const EDGE = 0.002;
const MAX_PHOTO_SIDE = 2400;

const validators = {
  to_firstname: (v) => (v.trim() ? '' : 'Enter your first name.'),
  to_lastname: (v) => (v.trim() ? '' : 'Enter your last name.'),
  to_phone: (v) => {
    const digits = v.replace(/[\s()+-]/g, '');
    return /^\d{7,15}$/.test(digits) ? '' : 'Enter a valid phone number, for example 0803 123 4567.';
  },
  to_email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address.'),
  to_address: (v) => (v.trim().length >= 5 ? '' : 'Enter your address.'),
};

function validate(values) {
  const errors = {};
  Object.keys(validators).forEach((k) => {
    const msg = validators[k](values[k]);
    if (msg) errors[k] = msg;
  });
  return errors;
}

function readDraft() {
  try {
    return { ...EMPTY, ...JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}') };
  } catch {
    return EMPTY;
  }
}

const Arrow = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" width="18" height="18">
    <path d="M4 10h11M11 5.5 15.5 10 11 14.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Icon({ d }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" width="18" height="18">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Field({ id, label, error, children }) {
  return (
    <div className={`rg-field${error ? ' rg-field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p className="rg-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function RegisterFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(readDraft);
  const [errors, setErrors] = useState({});
  const [flier, setFlier] = useState(null);
  const [flierFailed, setFlierFailed] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [t, setT] = useState(IDENTITY);
  const [photoError, setPhotoError] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitDetail, setSubmitDetail] = useState('');
  const fileRef = useRef(null);
  const headingRef = useRef(null);
  const panelRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    document.body.classList.add('rg-body');
    return () => document.body.classList.remove('rg-body');
  }, []);

  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const load = () => {
      const img = new Image();
      img.onload = () => !cancelled && setFlier(img);
      img.onerror = () => {
        if (cancelled) return;
        tries += 1;
        if (tries < 3) setTimeout(load, 600 * tries);
        else setFlierFailed(true);
      };
      img.src = flierSrc;
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {
      // draft persistence is a convenience only
    }
  }, [values]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  const setField = (name) => (e) => {
    const { value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: validators[name](value) }));
  };
  const blurField = (name) => () => setErrors((er) => ({ ...er, [name]: validators[name](values[name]) }));
  const fieldProps = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: setField(name),
    onBlur: blurField(name),
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  const goDetails = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }
    setStep(1);
  };

  const loadPhoto = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file such as a JPG or PNG.');
      return;
    }
    setPhotoBusy(true);
    setPhotoError('');
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas);
      setT(initialTransform(canvas));
    } catch {
      setPhotoError("We couldn't read that image. Try a JPG or PNG.");
    } finally {
      URL.revokeObjectURL(url);
      setPhotoBusy(false);
    }
  };

  const pickPhoto = useCallback(() => fileRef.current?.click(), []);

  // Every change goes through here so the circle is always fully covered by the photo.
  // Zooming keeps whatever is under the circle's centre in place, so a face that is in
  // view stays in view.
  const updateT = useCallback(
    (partial) =>
      setT((cur) => {
        const next = { ...cur, ...partial };
        if (partial.zoom !== undefined && partial.ox === undefined && partial.oy === undefined) {
          const k = next.zoom / cur.zoom;
          next.ox = cur.ox * k;
          next.oy = cur.oy * k;
        }
        return photo ? { ...next, ...clampOffsets(photo, next) } : next;
      }),
    [photo]
  );
  // Rotate about the circle's centre: the offset turns with the photo.
  const rotate = (dir) =>
    updateT({ rotation: t.rotation + dir * 90, ox: dir > 0 ? -t.oy : t.oy, oy: dir > 0 ? t.ox : -t.ox });
  const pan = (dx, dy) => updateT({ ox: t.ox + dx, oy: t.oy + dy });
  const limits = photo ? panLimits(photo, t) : { mx: 0, my: 0 };
  const noRoom = limits.mx < EDGE && limits.my < EDGE;

  const goPhoto = () => {
    if (!photo) {
      setPhotoError('Add a photo to continue.');
      return;
    }
    setStep(2);
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError('');
    setSubmitDetail('');

    // Build the invite first: if that fails, nothing has been sent yet, so a retry cannot double-register.
    let blob;
    try {
      blob = await renderInviteBlob(flier, photo, t);
    } catch (err) {
      console.error('Invite render failed', err);
      setSubmitError("We couldn't build your invite from that photo. Go back, choose a different photo and try again.");
      setSubmitDetail(err?.message || '');
      setSubmitting(false);
      return;
    }

    let sent;
    try {
      sent = await submitRegistration(values, blob);
    } catch (err) {
      console.error('Registration submit failed', err);
      setSubmitError(
        err.message === 'network'
          ? "We couldn't reach the server. Check your connection and try again."
          : err.message === 'invalid'
            ? 'Some of your details were not accepted. Go back, check them and try again.'
            : "We couldn't submit your registration. Please try again in a moment."
      );
      setSubmitDetail(err.detail || '');
      setSubmitting(false);
      return;
    }

    try {
      await saveInvite(blob);
    } catch {
      // The invite can still be rebuilt from the form; do not block a registration that already went through.
    }
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
    navigate('/thanks', {
      state: { firstName: values.to_firstname.trim(), email: values.to_email.trim(), emailSent: sent.confirmation },
    });
  };

  const startOver = () => {
    clearInvite();
    setValues(EMPTY);
    setPhoto(null);
    setT(IDENTITY);
    setStep(0);
  };

  const zoomFill = `${((t.zoom - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100}%`;

  return (
    <div className={`rg rg--step${step}`}>
      <a className="rg-skip" href="#rg-panel">Skip to the form</a>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="rg-file"
        tabIndex={-1}
        onChange={(e) => {
          loadPhoto(e.target.files[0]);
          e.target.value = '';
        }}
      />

      <header className="rg-top">
        <img className="rg-mark" src={markSrc} alt="" width="40" height="40" />
        <span className="rg-wordmark">{EVENT.name}</span>
        <span className="rg-year">{EVENT.year}</span>
        <a className="rg-enq" href={`tel:${EVENT.enquiries.tel}`}>Enquiries {EVENT.enquiries.display}</a>
      </header>

      <main className="rg-shell">
        <aside className="rg-preview" aria-label="Invite preview">
          <InviteStage
            flier={flier}
            photo={photo}
            transform={t}
            interactive={step === 1}
            onTransform={updateT}
            failed={flierFailed}
            onPick={pickPhoto}
          />
        </aside>

        <section className="rg-panel" id="rg-panel" ref={panelRef}>
          <div className="rg-card">
            <div className="rg-card-core">
              <p className="rg-eyebrow">Registration · 21 – 25 October {EVENT.year}</p>
              <ol className="rg-steps" aria-label="Progress">
                {STEPS.map((label, i) => (
                  <li
                    key={label}
                    className={`rg-step${i === step ? ' is-current' : ''}${i < step ? ' is-done' : ''}`}
                    aria-current={i === step ? 'step' : undefined}
                  >
                    {i < step ? (
                      <button type="button" onClick={() => setStep(i)} aria-label={`Go back to ${label}`}>
                        <span className="rg-mk" aria-hidden="true" />
                        <span className="rg-step-label">{label}</span>
                      </button>
                    ) : (
                      <span className="rg-step-inner">
                        <span className="rg-mk" aria-hidden="true" />
                        <span className="rg-step-label">{label}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ol>

              <div className="rg-step-body" key={step}>
                {step === 0 && (
                  <form onSubmit={goDetails} noValidate>
                    <h2 className="rg-h2" tabIndex={-1} ref={headingRef}>Your details</h2>
                    <p className="rg-sub">We use these to confirm your seat and send your invite.</p>

                    <div className="rg-peek">
                      <img src={flierSrc} alt="" width="76" height="101" />
                      <p>
                        <strong>Your invite is this flier</strong>
                        with your photo in the circle.
                      </p>
                    </div>

                    <div className="rg-row">
                      <Field id="to_firstname" label="First name" error={errors.to_firstname}>
                        <input {...fieldProps('to_firstname')} type="text" autoComplete="given-name" autoCapitalize="words" />
                      </Field>
                      <Field id="to_lastname" label="Last name" error={errors.to_lastname}>
                        <input {...fieldProps('to_lastname')} type="text" autoComplete="family-name" autoCapitalize="words" />
                      </Field>
                    </div>
                    <Field id="to_phone" label="Phone number" error={errors.to_phone}>
                      <input {...fieldProps('to_phone')} type="tel" inputMode="tel" autoComplete="tel" />
                    </Field>
                    <Field id="to_email" label="Email" error={errors.to_email}>
                      <input {...fieldProps('to_email')} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck="false" />
                    </Field>
                    <Field id="to_address" label="Address" error={errors.to_address}>
                      <textarea {...fieldProps('to_address')} rows={3} autoComplete="street-address" />
                    </Field>

                    <div className="rg-actions">
                      <button type="submit" className="rg-btn rg-btn--primary">
                        <span>Continue to photo</span>
                        <span className="rg-btn-icon"><Arrow /></span>
                      </button>
                    </div>
                  </form>
                )}

                {step === 1 && (
                  <div>
                    <h2 className="rg-h2" tabIndex={-1} ref={headingRef}>{photo ? 'Bring your face into view' : 'Add your photo'}</h2>
                    <p className="rg-sub">
                      {photo ? 'Drag the photo to move it. Zoom until you are happy with the circle.' : 'Choose a clear, well-lit photo of your face.'}
                    </p>

                    {!photo ? (
                      <button type="button" className="rg-drop" onClick={pickPhoto} disabled={photoBusy}>
                        <span className="rg-drop-icon"><Icon d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 13.5v1.2A1.3 1.3 0 0 0 5.3 16h9.4a1.3 1.3 0 0 0 1.3-1.3v-1.2" /></span>
                        <strong>{photoBusy ? 'Reading your photo' : 'Upload a photo'}</strong>
                        <span>JPG, PNG or a photo from your camera roll</span>
                      </button>
                    ) : (
                      <div className="rg-tools">
                        <PhotoEditor photo={photo} transform={t} onTransform={updateT} />
                        <p className="rg-hint" aria-live="polite">
                          {noRoom
                            ? 'Zoom in to move your photo around.'
                            : 'Drag, or use the arrows, to bring your face into the circle.'}
                        </p>

                        <label className="rg-range" style={{ '--fill': zoomFill }}>
                          <span>Zoom</span>
                          <input
                            type="range"
                            min={ZOOM_MIN}
                            max={ZOOM_MAX}
                            step="0.01"
                            value={t.zoom}
                            onChange={(e) => updateT({ zoom: Number(e.target.value) })}
                            aria-label="Zoom"
                          />
                        </label>

                        <div className="rg-move" role="group" aria-label="Move photo">
                          <span className="rg-move-label">Move</span>
                          <button type="button" className="rg-iconbtn" aria-label="Move photo up" disabled={t.oy <= -limits.my + EDGE} onClick={() => pan(0, -PAN_STEP)}>
                            <Icon d="M10 15V5m0 0L5.5 9.5M10 5l4.5 4.5" />
                          </button>
                          <button type="button" className="rg-iconbtn" aria-label="Move photo down" disabled={t.oy >= limits.my - EDGE} onClick={() => pan(0, PAN_STEP)}>
                            <Icon d="M10 5v10m0 0-4.5-4.5M10 15l4.5-4.5" />
                          </button>
                          <button type="button" className="rg-iconbtn" aria-label="Move photo left" disabled={t.ox <= -limits.mx + EDGE} onClick={() => pan(-PAN_STEP, 0)}>
                            <Icon d="M15 10H5m0 0 4.5-4.5M5 10l4.5 4.5" />
                          </button>
                          <button type="button" className="rg-iconbtn" aria-label="Move photo right" disabled={t.ox >= limits.mx - EDGE} onClick={() => pan(PAN_STEP, 0)}>
                            <Icon d="M5 10h10m0 0-4.5-4.5M15 10l-4.5 4.5" />
                          </button>
                          <button type="button" className="rg-chip rg-chip--quiet" onClick={() => updateT(initialTransform(photo))}>Reset</button>
                        </div>

                        <div className="rg-chips">
                          <button type="button" className="rg-chip" onClick={() => rotate(-1)}>
                            <Icon d="M5 8.5A5.5 5.5 0 1 1 5.6 14M5 4v4.5h4.5" /> Rotate left
                          </button>
                          <button type="button" className="rg-chip" onClick={() => rotate(1)}>
                            <Icon d="M15 8.5A5.5 5.5 0 1 0 14.4 14M15 4v4.5h-4.5" /> Rotate right
                          </button>
                          <button type="button" className="rg-chip" onClick={pickPhoto} disabled={photoBusy}>
                            <Icon d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 13.5v1.2A1.3 1.3 0 0 0 5.3 16h9.4a1.3 1.3 0 0 0 1.3-1.3v-1.2" /> Change photo
                          </button>
                        </div>
                      </div>
                    )}

                    {photoError && <p className="rg-error rg-error--block" role="alert">{photoError}</p>}

                    <div className="rg-actions rg-actions--split">
                      <button type="button" className="rg-btn rg-btn--ghost" onClick={() => setStep(0)}>Back</button>
                      <button type="button" className="rg-btn rg-btn--primary" onClick={goPhoto} disabled={photoBusy}>
                        <span>Review</span>
                        <span className="rg-btn-icon"><Arrow /></span>
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="rg-h2" tabIndex={-1} ref={headingRef}>Review and finish</h2>
                    <p className="rg-sub">Check your details, then get your invite.</p>

                    <dl className="rg-summary">
                      <div><dt>Name</dt><dd>{values.to_firstname} {values.to_lastname}</dd></div>
                      <div><dt>Phone</dt><dd>{values.to_phone}</dd></div>
                      <div><dt>Email</dt><dd>{values.to_email}</dd></div>
                      <div><dt>Address</dt><dd>{values.to_address}</dd></div>
                    </dl>
                    <button type="button" className="rg-link" onClick={() => setStep(0)}>Edit details</button>

                    {submitError && (
                      <p className="rg-error rg-error--block" role="alert">
                        {submitError}
                        {submitDetail && <small className="rg-error-detail">Reason: {submitDetail}</small>}
                      </p>
                    )}

                    <div className="rg-actions rg-actions--split">
                      <button type="button" className="rg-btn rg-btn--ghost" onClick={() => setStep(1)} disabled={submitting}>Back</button>
                      <button type="button" className="rg-btn rg-btn--primary" onClick={submit} disabled={submitting || !flier}>
                        <span>{submitting ? 'Preparing your invite' : 'Get my invite'}</span>
                        <span className="rg-btn-icon">{submitting ? <span className="rg-spin" /> : <Arrow />}</span>
                      </button>
                    </div>
                    <p className="rg-fine" aria-live="polite">
                      {submitting ? 'Registering you and building your invite. This takes a few seconds.' : 'Your details are used only for this event.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(values.to_firstname || photo) && (
            <button type="button" className="rg-link rg-link--quiet" onClick={startOver}>Start over</button>
          )}
        </section>
      </main>

      <footer className="rg-foot">
        Enquiries <a href={`tel:${EVENT.enquiries.tel}`}>{EVENT.enquiries.display}</a>
        <span aria-hidden="true"> · </span>
        Convened by {EVENT.conveners}
      </footer>
    </div>
  );
}
