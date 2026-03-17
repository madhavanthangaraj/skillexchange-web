// src/components/ReviewCard.js
import React from 'react';

export default function ReviewCard({ review }) {
  const initials = review.reviewer?.name
    ? review.reviewer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="card review-card">
      <div className="review-header">
        <div className="review-user">
          <div className="avatar avatar-sm">{initials}</div>
          <div>
            <div className="review-user-name">{review.reviewer?.name}</div>
            <div className="review-date">{date}</div>
          </div>
        </div>
        <div className="review-stars">{stars}</div>
      </div>
      {review.skillReviewed && (
        <div style={{ marginBottom: '8px' }}>
          <span className="skill-tag">{review.skillReviewed}</span>
        </div>
      )}
      {review.comment && <p className="review-comment">"{review.comment}"</p>}
    </div>
  );
}
